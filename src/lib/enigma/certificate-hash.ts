import { sha256, toUtf8Bytes } from "ethers";

export const COURSE_NAME = "Blockchain Fundamentals";

export function certificatePayload({
  first,
  last,
  completedAt,
  verificationCode,
}: {
  first: string;
  last: string;
  completedAt: string;
  verificationCode: string;
}) {
  return JSON.stringify({
    studentName: `${first} ${last}`,
    courseName: COURSE_NAME,
    completionDate: completedAt,
    verificationCode,
  });
}

export function certificateDigest(payload: Parameters<typeof certificatePayload>[0]) {
  return sha256(toUtf8Bytes(certificatePayload(payload)));
}
