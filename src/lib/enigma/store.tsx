import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { labs, stepReward } from "./labs";
import { loadInstructor, loadStudent, saveStudent } from "./server";
import type { ProfileData } from "./types";

export type Profile = ProfileData;
export type Question = { id: string; lab: string; text: string; options: string[]; answer: number };
type Data = {
  profiles: Profile[];
  active: string;
  role: "student" | "instructor";
  theme: "dark" | "light";
  questions: Question[];
};
const blankProfile: Profile = {
  id: "",
  first: "",
  last: "",
  nickname: "",
  character: 0,
  xp: 0,
  done: [],
  steps: {},
  unlocked: [],
  started: {},
  quizzes: {},
};
const initial: Data = { profiles: [], active: "", role: "student", theme: "dark", questions: [] };
const Context = createContext<{
  data: Data;
  profile: Profile;
  ready: boolean;
  update: (f: (d: Data) => Data) => void;
  updateProfile: (f: (p: Profile) => Profile, id?: string) => void;
  completeStep: (lab: string, step: number, skipped: boolean) => void;
} | null>(null);

export function LabProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(initial);
  const dataRef = useRef(data);
  const persistenceQueue = useRef(Promise.resolve());
  const studentQuery = useQuery({
    queryKey: ["enigma", "student"],
    queryFn: () => loadStudent(),
    retry: false,
  });
  const instructorQuery = useQuery({
    queryKey: ["enigma", "instructor"],
    queryFn: () => loadInstructor(),
    retry: false,
  });
  const ready = studentQuery.isFetched && instructorQuery.isFetched;

  useEffect(() => {
    const current = studentQuery.data;
    if (current) {
      const restored = {
        ...dataRef.current,
        profiles: [current],
        active: current.id,
        role: "student" as const,
      };
      dataRef.current = restored;
      setData(restored);
    }
  }, [studentQuery.data]);
  useEffect(() => {
    const records = instructorQuery.data;
    if (records) {
      const profiles = records.map((record) => record.profile);
      const restored = {
        ...dataRef.current,
        profiles,
        active: profiles[0]?.id ?? "",
        role: "instructor" as const,
      };
      dataRef.current = restored;
      setData(restored);
    }
  }, [instructorQuery.data]);
  useEffect(() => {
    document.documentElement.dataset["theme"] = data.theme;
  }, [data.theme]);

  const profile =
    data.profiles.find((item) => item.id === data.active) ?? data.profiles[0] ?? blankProfile;
  const update = (transform: (current: Data) => Data) => {
    const current = dataRef.current;
    const next = transform(current);
    dataRef.current = next;
    setData(next);
    const before = current.profiles.find((item) => item.id === current.active);
    const after = next.profiles.find((item) => item.id === next.active);
    if (ready && before && after && before !== after && current.role === "student") {
      persistenceQueue.current = persistenceQueue.current
        .then(() => saveStudent({ data: after }))
        .then(() => undefined)
        .catch(() => undefined);
    }
  };
  const updateProfile = (transform: (current: Profile) => Profile, id = profile.id) =>
    update((current) => ({
      ...current,
      profiles: current.profiles.map((item) => (item.id === id ? transform(item) : item)),
    }));
  function completeStep(labId: string, step: number, skipped: boolean) {
    updateProfile((current) => {
      if (current.steps[labId]?.[step]) return current;
      const steps: Profile["steps"] = {
        ...current.steps,
        [labId]: {
          ...(current.steps[labId] ?? {}),
          [String(step)]: skipped ? ("skipped" as const) : ("done" as const),
        },
      };
      const lab = labs.find((item) => item.id === labId);
      const finished = Boolean(
        lab && lab.steps.every((_, index) => steps[labId]?.[String(index)] !== undefined),
      );
      const done =
        finished && !current.done.includes(labId) ? [...current.done, labId] : current.done;
      const completedAt =
        done.length === labs.length
          ? (current.completedAt ?? new Date().toISOString())
          : current.completedAt;
      return {
        ...current,
        steps,
        done,
        xp: current.xp + stepReward(skipped),
        ...(completedAt ? { completedAt } : {}),
      };
    });
  }
  return (
    <Context.Provider value={{ data, profile, ready, update, updateProfile, completeStep }}>
      {children}
    </Context.Provider>
  );
}

export function useLab() {
  const context = useContext(Context);
  if (!context) throw new Error("LabProvider required");
  return context;
}

export function skippedCount(profile: Profile) {
  return Object.values(profile.steps)
    .flatMap(Object.values)
    .filter((status) => status === "skipped").length;
}
