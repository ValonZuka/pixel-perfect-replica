import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { eq, sql } from "drizzle-orm";
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { id as eventTopic, sha256, toUtf8Bytes } from "ethers";
import { certificateDigest } from "./certificate-hash";
import { z } from "zod";
import { labs } from "./labs";
import { classroomPinAttempts, classroomProfiles, classroomSessions, db } from "./db";
import type { ProfileData } from "./types";

const profileSchema = z
  .object({
    id: z.string().min(1).max(80),
    first: z.string().trim().min(1).max(50),
    last: z.string().trim().min(1).max(50),
    nickname: z
      .string()
      .trim()
      .min(2)
      .max(24)
      .regex(/^[a-zA-Z0-9_-]+$/),
    character: z.number().int().min(0).max(5),
    xp: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    done: z.array(z.string().refine((id) => labs.some((lab) => lab.id === id))).max(7),
    steps: z.record(z.string(), z.record(z.string(), z.enum(["done", "skipped"]))),
    unlocked: z.array(z.string().refine((id) => labs.some((lab) => lab.id === id))).max(7),
    started: z
      .record(z.string(), z.number().int().nonnegative())
      .refine((started) => Object.keys(started).every((id) => labs.some((lab) => lab.id === id))),
    quizzes: z
      .record(z.string(), z.array(z.number().int().min(0).max(3).nullable()).max(50))
      .refine((quizzes) => Object.keys(quizzes).every((id) => labs.some((lab) => lab.id === id))),
    completedAt: z.string().optional(),
    approvedAt: z.string().optional(),
    verificationCode: z.string().optional(),
    txHash: z.string().optional(),
    polygonContractAddress: z.string().optional(),
    polygonNetwork: z.enum(["amoy", "polygon"]).optional(),
  })
  .superRefine((profile, context) => {
    for (const [labId, recorded] of Object.entries(profile.steps)) {
      const lab = labs.find((item) => item.id === labId);
      if (
        !lab ||
        Object.keys(recorded).some(
          (step) => !/^\d+$/.test(step) || Number(step) >= lab.steps.length,
        )
      ) {
        context.addIssue({ code: "custom", message: "Progresi përmban hapa të pavlefshëm." });
      }
    }
    if (Object.keys(profile.steps).length > labs.length) {
      context.addIssue({ code: "custom", message: "Progresi përmban shumë laboratorë." });
    }
  });

const pinInput = z.string().regex(/^\d{4}$/);
const nicknameInput = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[a-zA-Z0-9_-]+$/);
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const pinHash = (pin: string, salt: string) => scryptSync(pin, salt, 64).toString("hex");
const constantEquals = (left: string, right: string) => {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
};

async function createSession(profileId: string, role: "student" | "instructor") {
  const previousToken = getCookie("enigma_session");
  if (previousToken)
    await db.delete(classroomSessions).where(eq(classroomSessions.tokenHash, hash(previousToken)));
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(classroomSessions).values({ tokenHash: hash(token), profileId, role, expiresAt });
  setCookie("enigma_session", token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] !== "test",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

async function session() {
  const token = getCookie("enigma_session");
  if (!token) return null;
  const [found] = await db
    .select()
    .from(classroomSessions)
    .where(eq(classroomSessions.tokenHash, hash(token)))
    .limit(1);
  if (!found || found.expiresAt.getTime() <= Date.now()) return null;
  return found;
}

async function recordFailedPin(nickname: string) {
  await db
    .insert(classroomPinAttempts)
    .values({ nickname, failedAttempts: 1 })
    .onConflictDoUpdate({
      target: classroomPinAttempts.nickname,
      set: {
        failedAttempts: sql`CASE WHEN ${classroomPinAttempts.failedAttempts} >= 4 THEN 0 ELSE ${classroomPinAttempts.failedAttempts} + 1 END`,
        lockedUntil: sql`CASE WHEN ${classroomPinAttempts.failedAttempts} >= 4 THEN now() + interval '60 seconds' ELSE NULL END`,
      },
    });
}

async function isLocked(nickname: string) {
  const [attempt] = await db
    .select()
    .from(classroomPinAttempts)
    .where(eq(classroomPinAttempts.nickname, nickname))
    .limit(1);
  if (attempt?.lockedUntil && attempt.lockedUntil.getTime() > Date.now()) return true;
  if (attempt?.lockedUntil)
    await db.delete(classroomPinAttempts).where(eq(classroomPinAttempts.nickname, nickname));
  return false;
}

function authoritativeProfile(
  candidate: z.infer<typeof profileSchema>,
  previous?: ProfileData,
): ProfileData {
  const steps: z.infer<typeof profileSchema>["steps"] = {};
  for (const lab of labs) {
    const recorded = candidate.steps[lab.id] ?? {};
    const previousSteps = previous?.steps[lab.id] ?? {};
    const valid: Record<string, "done" | "skipped"> = {};
    for (let index = 0; index < lab.steps.length; index += 1) {
      const key = String(index);
      const value = previousSteps[key] ?? recorded[key];
      if (value === "done" || value === "skipped") valid[key] = value;
    }
    if (Object.keys(valid).length) steps[lab.id] = valid;
  }
  const done = labs
    .filter((lab) => lab.steps.every((_, index) => steps[lab.id]?.[String(index)] !== undefined))
    .map((lab) => lab.id);
  const stepXp = Object.values(steps).reduce(
    (total, labSteps) =>
      total + Object.values(labSteps).filter((status) => status === "done").length * 2,
    0,
  );
  const quizzes: ProfileData["quizzes"] = {};
  for (const lab of labs) {
    const submitted = candidate.quizzes[lab.id] ?? [];
    const recorded = previous?.quizzes[lab.id] ?? [];
    const length = Math.max(submitted.length, recorded.length);
    quizzes[lab.id] = Array.from(
      { length },
      (_, index) => recorded[index] ?? submitted[index] ?? null,
    );
  }
  const quizXp = done.reduce((total, labId) => {
    const answers = quizzes[labId] ?? [];
    return total + Number(answers[0] === 1) + Number(answers[1] === 2) + Number(answers[2] === 0);
  }, 0);
  const xp = stepXp + quizXp;
  const completedAt =
    done.length === labs.length
      ? typeof previous?.["completedAt"] === "string"
        ? previous["completedAt"]
        : new Date().toISOString()
      : undefined;
  return {
    ...candidate,
    quizzes,
    id: previous?.id ?? candidate.id,
    first: previous?.first ?? candidate.first,
    last: previous?.last ?? candidate.last,
    nickname: previous?.nickname ?? candidate.nickname,
    unlocked: previous?.unlocked ?? candidate.unlocked,
    xp,
    done,
    steps,
    ...(completedAt ? { completedAt } : {}),
    ...(previous?.["approvedAt"] ? { approvedAt: previous["approvedAt"] } : {}),
    ...(previous?.["verificationCode"] ? { verificationCode: previous["verificationCode"] } : {}),
    ...(previous?.["txHash"] ? { txHash: previous["txHash"] } : {}),
    ...(previous?.["polygonContractAddress"]
      ? { polygonContractAddress: previous["polygonContractAddress"] }
      : {}),
    ...(previous?.["polygonNetwork"] ? { polygonNetwork: previous["polygonNetwork"] } : {}),
  } as ProfileData;
}

export const createStudent = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      first: z.string().trim().min(1).max(50),
      last: z.string().trim().min(1).max(50),
      nickname: nicknameInput,
      pin: pinInput,
      character: z.number().int().min(0).max(5),
    }),
  )
  .handler(async ({ data }) => {
    const normalized = data.nickname.toLowerCase();
    const id = randomBytes(16).toString("hex");
    const salt = randomBytes(16).toString("hex");
    const profile = authoritativeProfile({
      id,
      first: data.first,
      last: data.last,
      nickname: normalized,
      character: data.character,
      xp: 0,
      done: [],
      steps: {},
      unlocked: [],
      started: {},
      quizzes: {},
    });
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(7824619)`);
      const [count] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(classroomProfiles);
      if ((count?.count ?? 0) >= 35)
        throw new Error("Është arritur kufiri prej 35 profilesh të klasës.");
      await tx.insert(classroomProfiles).values({
        id,
        nickname: normalized,
        pinSalt: salt,
        pinHash: pinHash(data.pin, salt),
        profile,
      });
    });
    await createSession(id, "student");
    return profile;
  });

export const loginStudent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ nickname: nicknameInput, pin: pinInput }))
  .handler(async ({ data }) => {
    const nickname = data.nickname.toLowerCase();
    if (await isLocked(nickname)) throw new Error("Shumë prova të pasakta. Prit 60 sekonda.");
    const [record] = await db
      .select()
      .from(classroomProfiles)
      .where(eq(classroomProfiles.nickname, nickname))
      .limit(1);
    if (!record || !constantEquals(pinHash(data.pin, record.pinSalt), record.pinHash)) {
      await recordFailedPin(nickname);
      throw new Error("Pseudonimi ose PIN-i nuk është i saktë.");
    }
    await db.delete(classroomPinAttempts).where(eq(classroomPinAttempts.nickname, nickname));
    await createSession(record.id, "student");
    return record.profile;
  });

export const loginInstructor = createServerFn({ method: "POST" })
  .inputValidator(z.object({ pin: pinInput }))
  .handler(async ({ data }) => {
    const nickname = "__instructor__";
    if (await isLocked(nickname)) throw new Error("Shumë prova të pasakta. Prit 60 sekonda.");
    const configuredPin = process.env["INSTRUCTOR_PIN"];
    if (
      !configuredPin ||
      !constantEquals(
        pinHash(data.pin, "enigma-instructor-v1"),
        pinHash(configuredPin, "enigma-instructor-v1"),
      )
    ) {
      await recordFailedPin(nickname);
      throw new Error("PIN-i i ligjëruesit nuk është i saktë.");
    }
    await db.delete(classroomPinAttempts).where(eq(classroomPinAttempts.nickname, nickname));
    await createSession("instructor", "instructor");
    return { ok: true };
  });

export const loadStudent = createServerFn({ method: "GET" }).handler(async () => {
  const active = await session();
  if (!active || active.role !== "student") return null;
  const [record] = await db
    .select()
    .from(classroomProfiles)
    .where(eq(classroomProfiles.id, active.profileId))
    .limit(1);
  return record?.profile ?? null;
});

export const saveStudent = createServerFn({ method: "POST" })
  .inputValidator(profileSchema)
  .handler(async ({ data }) => {
    const active = await session();
    if (!active || active.role !== "student" || active.profileId !== data.id)
      throw new Error("Sesioni ka skaduar. Hyr përsëri.");
    return db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(classroomProfiles)
        .where(eq(classroomProfiles.id, active.profileId))
        .for("update");
      if (!record) throw new Error("Profili nuk u gjet.");
      const verified = authoritativeProfile(data, record.profile);
      await tx
        .update(classroomProfiles)
        .set({ profile: verified, updatedAt: new Date() })
        .where(eq(classroomProfiles.id, active.profileId));
      return verified;
    });
  });

export const instructorProfiles = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ profile: ProfileData }[]> => {
    const active = await session();
    if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
    return db.select({ profile: classroomProfiles.profile }).from(classroomProfiles);
  },
);

export const unlockStudentSession = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1), labId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const active = await session();
    if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
    if (!labs.some((lab) => lab.id === data.labId)) throw new Error("Seanca nuk u gjet.");
    const [record] = await db
      .select()
      .from(classroomProfiles)
      .where(eq(classroomProfiles.id, data.id))
      .limit(1);
    if (!record) throw new Error("Profili nuk u gjet.");
    const unlocked = [...new Set([...record.profile.unlocked, data.labId])];
    const updated = { ...record.profile, unlocked };
    await db
      .update(classroomProfiles)
      .set({ profile: updated, updatedAt: new Date() })
      .where(eq(classroomProfiles.id, data.id));
    return updated;
  });

export const resetStudentPin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const active = await session();
    if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
    const [record] = await db
      .select({ id: classroomProfiles.id })
      .from(classroomProfiles)
      .where(eq(classroomProfiles.id, data.id))
      .limit(1);
    if (!record) throw new Error("Profili nuk u gjet.");
    const pin = String(randomInt(1000, 10_000));
    const salt = randomBytes(16).toString("hex");
    await db
      .update(classroomProfiles)
      .set({ pinSalt: salt, pinHash: pinHash(pin, salt), updatedAt: new Date() })
      .where(eq(classroomProfiles.id, data.id));
    return { pin };
  });

export const approveStudentCertificate = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const active = await session();
    if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
    return db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(classroomProfiles)
        .where(eq(classroomProfiles.id, data.id))
        .for("update");
      if (!record) throw new Error("Profili nuk u gjet.");
      const profile = record.profile;
      if (
        !labs.every((lab) =>
          lab.steps.every((_, index) => profile.steps[lab.id]?.[String(index)] !== undefined),
        )
      )
        throw new Error("Studenti duhet t’i përfundojë të gjithë hapat para miratimit.");
      if (profile.approvedAt && profile.verificationCode) return profile;
      const updated = {
        ...profile,
        approvedAt: new Date().toISOString(),
        verificationCode: randomBytes(8).toString("hex").toUpperCase(),
      };
      await tx
        .update(classroomProfiles)
        .set({ profile: updated, updatedAt: new Date() })
        .where(eq(classroomProfiles.id, data.id));
      return updated;
    });
  });

export const anchorStudentCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
      contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      network: z.enum(["amoy", "polygon"]),
    }),
  )
  .handler(async ({ data }) => {
    const active = await session();
    if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
    const [record] = await db
      .select()
      .from(classroomProfiles)
      .where(eq(classroomProfiles.id, data.id))
      .limit(1);
    if (
      !record?.profile.approvedAt ||
      !record.profile.verificationCode ||
      !record.profile.completedAt
    )
      throw new Error("Certifikata duhet të miratohet para publikimit.");

    const networkConfig =
      data.network === "polygon"
        ? { rpcUrl: "https://polygon-bor-rpc.publicnode.com", chainId: "0x89" }
        : { rpcUrl: "https://rpc-amoy.polygon.technology", chainId: "0x13882" };
    const rpc = async (method: string, params: string[]) => {
      const response = await fetch(networkConfig.rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (!response.ok) throw new Error("Rrjeti Polygon nuk u përgjigj. Provo përsëri.");
      return response.json() as Promise<{ result?: unknown }>;
    };
    const chain = await rpc("eth_chainId", []);
    if (chain.result !== networkConfig.chainId)
      throw new Error("Transaksioni nuk u verifikua në rrjetin e zgjedhur.");
    const receiptResponse = await rpc("eth_getTransactionReceipt", [data.txHash]);
    const receipt = receiptResponse.result as {
      status?: string;
      logs?: { address?: string; topics?: string[] }[];
    } | null;
    const certificateId = certificateDigest({
      first: record.profile.first,
      last: record.profile.last,
      completedAt: record.profile.completedAt,
      verificationCode: record.profile.verificationCode,
    });
    const studentHash = sha256(toUtf8Bytes(record.profile.id));
    const expectedEvent = eventTopic("CertificateAnchored(bytes32,bytes32,uint64,address)");
    const verified =
      receipt?.status === "0x1" &&
      receipt.logs?.some(
        (log) =>
          log.address?.toLowerCase() === data.contractAddress.toLowerCase() &&
          log.topics?.[0]?.toLowerCase() === expectedEvent.toLowerCase() &&
          log.topics?.[1]?.toLowerCase() === certificateId.toLowerCase() &&
          log.topics?.[2]?.toLowerCase() === studentHash.toLowerCase(),
      );
    if (!verified)
      throw new Error("Transaksioni nuk përputhet me certifikatën në kontratën e regjistruar.");

    const updated = {
      ...record.profile,
      txHash: data.txHash,
      polygonContractAddress: data.contractAddress,
      polygonNetwork: data.network,
    };
    await db
      .update(classroomProfiles)
      .set({ profile: updated, updatedAt: new Date() })
      .where(eq(classroomProfiles.id, data.id));
    return updated;
  });

export const publicCertificate = createServerFn({ method: "GET" })
  .inputValidator(z.object({ code: z.string().min(1).max(40) }))
  .handler(async ({ data }) => {
    const [record] = await db
      .select({ profile: classroomProfiles.profile })
      .from(classroomProfiles)
      .where(sql`${classroomProfiles.profile}->>'verificationCode' = ${data.code.toUpperCase()}`)
      .limit(1);
    if (!record) return null;
    const profile = record.profile;
    if (!profile.approvedAt || !profile.completedAt || !profile.verificationCode) return null;
    return {
      first: profile.first,
      last: profile.last,
      completedAt: profile.completedAt,
      done: profile.done,
      approvedAt: profile.approvedAt,
      verificationCode: profile.verificationCode,
      ...(profile.txHash ? { txHash: profile.txHash } : {}),
      ...(profile.polygonContractAddress
        ? { polygonContractAddress: profile.polygonContractAddress }
        : {}),
      ...(profile.polygonNetwork ? { polygonNetwork: profile.polygonNetwork } : {}),
    };
  });

export const exportClassroomBackup = createServerFn({ method: "GET" }).handler(async () => {
  const active = await session();
  if (!active || active.role !== "instructor") throw new Error("Kërkohet hyrja e ligjëruesit.");
  const profiles = await db.select({ profile: classroomProfiles.profile }).from(classroomProfiles);
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    profiles: profiles.map((record) => record.profile),
  };
});

export const loadInstructor = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ profile: ProfileData }[] | null> => {
    const active = await session();
    if (!active || active.role !== "instructor") return null;
    return db.select({ profile: classroomProfiles.profile }).from(classroomProfiles);
  },
);

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie("enigma_session");
  if (token) await db.delete(classroomSessions).where(eq(classroomSessions.tokenHash, hash(token)));
  setCookie("enigma_session", "", {
    httpOnly: true,
    secure: process.env["NODE_ENV"] !== "test",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
});
