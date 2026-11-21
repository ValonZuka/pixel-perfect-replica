import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { labs, stepReward } from './labs';
export type Profile = { id: string; first: string; last: string; nickname: string; pin: string; character: number; xp: number; done: string[]; steps: Record<string, Record<string, 'done' | 'skipped'>>; unlocked: string[]; started: Record<string, number>; quizzes: Record<string, number[]>; completedAt?: string; approvedAt?: string };
export type Question = { id: string; lab: string; text: string; options: string[]; answer: number };
type Data = { profiles: Profile[]; active: string; role: 'student' | 'instructor'; theme: 'dark' | 'light'; questions: Question[] };
const demo: Profile = { id: 'valon', first: 'Valon', last: 'Zuka', nickname: 'valonz', pin: '1234', character: 0, xp: 46, done: ['lab-2', 'lab-6'], steps: { 'lab-2': Object.fromEntries((labs[0]?.steps ?? []).map((_, i) => [i, 'done'])), 'lab-6': Object.fromEntries((labs[1]?.steps ?? []).map((_, i) => [i, 'done'])), 'lab-8': { '0': 'done', '1': 'done' } }, unlocked: [], started: {}, quizzes: {} };
const initial: Data = { profiles: [demo, { ...demo, id: 'arta', first: 'Arta', last: 'Krasniqi', nickname: 'artak', character: 1, xp: 28, done: ['lab-2'], steps: { 'lab-2': { '0': 'done', '1': 'skipped' } } }, { ...demo, id: 'dion', first: 'Dion', last: 'Gashi', nickname: 'diong', character: 2, xp: 12, done: [], steps: {}, unlocked: [] }], active: 'valon', role: 'student', theme: 'dark', questions: [] };
const Context = createContext<{ data: Data; profile: Profile; ready: boolean; update: (f: (d: Data) => Data) => void; updateProfile: (f: (p: Profile) => Profile, id?: string) => void; completeStep: (lab: string, step: number, skipped: boolean) => void } | null>(null);
export function LabProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(initial); const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('enigma-lab-v1') || 'null'); if (saved?.profiles?.length) setData(saved); } catch { /* fresh state if invalid */ } setReady(true); }, []);
  useEffect(() => { if (ready) { localStorage.setItem('enigma-lab-v1', JSON.stringify(data)); document.documentElement.dataset['theme'] = data.theme; } }, [data, ready]);
  const profile = data.profiles.find(p => p.id === data.active) ?? data.profiles[0] ?? demo;
  const update = (f: (d: Data) => Data) => setData(f);
  const updateProfile = (f: (p: Profile) => Profile, id = profile.id) => setData(d => ({ ...d, profiles: d.profiles.map(p => p.id === id ? f(p) : p) }));
  function completeStep(labId: string, step: number, skipped: boolean) { updateProfile(p => { if (p.steps[labId]?.[step]) return p; const steps = { ...p.steps, [labId]: { ...(p.steps[labId] ?? {}), [step]: skipped ? 'skipped' as const : 'done' as const } }; const lab = labs.find(item => item.id === labId); const finished = Boolean(lab && Object.keys(steps[labId] ?? {}).length === lab.steps.length); const done = finished && !p.done.includes(labId) ? [...p.done, labId] : p.done; const completedAt = done.length === labs.length ? new Date().toISOString() : p.completedAt; return { ...p, steps, done, xp: p.xp + stepReward(skipped), ...(completedAt ? { completedAt } : {}) }; }); }
  return <Context.Provider value={{ data, profile, ready, update, updateProfile, completeStep }}>{children}</Context.Provider>;
}
export function useLab() { const c = useContext(Context); if (!c) throw new Error('LabProvider required'); return c; }
export function skippedCount(p: Profile) { return Object.values(p.steps).flatMap(Object.values).filter(s => s === 'skipped').length; }
