export type ProfileData = {
  id: string;
  first: string;
  last: string;
  nickname: string;
  character: number;
  xp: number;
  done: string[];
  steps: Record<string, Record<string, "done" | "skipped">>;
  unlocked: string[];
  started: Record<string, number>;
  quizzes: Record<string, (number | null)[]>;
  completedAt?: string;
  approvedAt?: string;
  verificationCode?: string;
  txHash?: string;
  polygonContractAddress?: string;
  polygonNetwork?: "amoy" | "polygon";
};
