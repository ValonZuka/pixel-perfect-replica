import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Clock3, LockKeyhole, Play, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canOpen, labs } from "@/lib/enigma/labs";
import { useLab } from "@/lib/enigma/store";
import { Quiz } from "./Quiz";
import { Character } from "./Character";
export function LabPage({ labId }: { labId: string }) {
  const { profile, updateProfile, completeStep } = useLab();
  const index = labs.findIndex((l) => l.id === labId);
  const lab = labs[index];
  const [os, setOs] = useState("win");
  const [now, setNow] = useState(0);
  const [pop, setPop] = useState(false);
  const [popStep, setPopStep] = useState<number | null>(null);
  const [skipPrompt, setSkipPrompt] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [copied, setCopied] = useState(-1);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!lab)
    return (
      <div className="tool-card">
        <h1>Laboratori nuk u gjet</h1>
        <Link to="/">Kthehu te paneli</Link>
      </div>
    );
  const activeLab = lab;
  if (!canOpen(index, profile.done, profile.unlocked))
    return (
      <div className="tool-card">
        <h1>
          <LockKeyhole className="inline" /> Mbyllur
        </h1>
        <p className="notice">Përfundo laboratorin e mëparshëm ose kërko hapjen nga ligjëruesi.</p>
        <Button asChild>
          <Link to="/">Kthehu te paneli</Link>
        </Button>
      </div>
    );
  const started = profile.started[labId];
  const done = profile.done.includes(labId);
  const statuses = profile.steps[labId] ?? {};
  const current = activeLab.steps.findIndex((_, i) => !statuses[i]);
  const elapsed = started ? Math.max(0, Math.floor((now - started) / 1000)) : 0;
  const replace = (s: string) =>
    s
      .replaceAll("{py}", os === "win" ? "python" : "python3")
      .replaceAll("{term}", os === "win" ? "PowerShell" : "Terminal")
      .replaceAll("{gitmac}", os === "mac" ? " Në Mac, prano instalimin e Command Line Tools." : "")
      .replaceAll(
        "{pynote}",
        os === "win" ? " Aktivizo Add Python to PATH." : " Përdor python3 në terminal.",
      );
  function finishStep(i: number, skipped: boolean) {
    completeStep(labId, i, skipped);
    setSkipPrompt(null);
    if (!skipped) {
      setPopStep(i);
      setPop(true);
      setTimeout(() => {
        setPop(false);
        setPopStep(null);
      }, 1500);
    }
    if (Object.keys(statuses).length + 1 === activeLab.steps.length) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 4000);
    }
  }
  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft />
        Laboratorët e mi
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            SEANCA {activeLab.s} · {activeLab.m} MINUTA
          </span>
          <h1>{activeLab.t}</h1>
          <p>{activeLab.g}</p>
        </div>
        <div className="role-switch">
          <Button
            variant="ghost"
            size="sm"
            className={os === "win" ? "selected" : ""}
            onClick={() => setOs("win")}
          >
            Windows
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={os === "mac" ? "selected" : ""}
            onClick={() => setOs("mac")}
          >
            Mac
          </Button>
        </div>
      </div>
      {activeLab.w && (
        <div className="notice">
          Përdor vetëm wallet testimi pa para reale. Seed phrase nuk ndahet me askënd.
        </div>
      )}
      <div className="lab-layout">
        <div>
          {activeLab.steps.map((step, i) => {
            const revealed = done || Boolean(statuses[i]) || Boolean(started && i === current);
            return (
              <section
                className={`step-card ${!revealed ? "step-locked" : ""} ${i === current && started ? "step-active" : ""}`}
                key={i}
              >
                {!revealed && (
                  <div className="locked-overlay">
                    <LockKeyhole size={15} />
                    {!started
                      ? "Nis kohëmatësin për të zbuluar hapat"
                      : "Përfundo hapin e mëparshëm"}
                  </div>
                )}
                <div
                  className={!revealed ? "blurred" : ""}
                  inert={!revealed}
                  aria-hidden={!revealed}
                >
                  <div className="step-label">
                    <span>
                      HAPI {String(i + 1).padStart(2, "0")} / {activeLab.steps.length}
                    </span>
                    <span>
                      {statuses[i] === "done"
                        ? "✓ Përfunduar"
                        : statuses[i] === "skipped"
                          ? "⚠ Kaluar"
                          : "+2 XP"}
                    </span>
                  </div>
                  <h3>{step[0]}</h3>
                  <p>{replace(step[1] ?? "")}</p>
                  {step
                    .slice(2)
                    .filter((code): code is string => Boolean(code))
                    .map((code, k) => (
                      <div className="code-box" key={k}>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Kopjo kodin"
                          title="Kopjo kodin"
                          onClick={async () => {
                            await navigator.clipboard.writeText(replace(code));
                            setCopied(i);
                            setTimeout(() => setCopied(-1), 1500);
                          }}
                        >
                          {copied === i ? <Check /> : <Copy />}
                        </Button>
                        <pre>
                          <code>{replace(code)}</code>
                        </pre>
                      </div>
                    ))}
                  {revealed && (!statuses[i] || (pop && popStep === i)) && (
                    <div className="step-actions">
                      <div className="complete-action-wrap">
                        <Button
                          disabled={Boolean(statuses[i])}
                          onClick={() => finishStep(i, false)}
                        >
                          <Check />U krye
                        </Button>
                        {!statuses[i] && (
                          <Button
                            variant="outline"
                            className={skipPrompt === i ? "skip-requested" : "skip-dodge"}
                            onClick={() => setSkipPrompt(i)}
                          >
                            Kam problem · kalo
                          </Button>
                        )}
                        {pop && popStep === i && (
                          <span className="xp-pop xp-pop-inline" role="status">
                            +2 XP ✦
                          </span>
                        )}
                      </div>
                      {skipPrompt === i && !statuses[i] && (
                        <div className="skip-warning" role="alert">
                          <p>
                            Mos e kalo ende — provo hapin edhe një herë ose kërko ndihmë nga
                            ligjëruesi.
                          </p>
                          <div>
                            <Button variant="outline" onClick={() => finishStep(i, true)}>
                              Po, kaloje · 0 XP
                            </Button>
                            <Button variant="ghost" onClick={() => setSkipPrompt(null)}>
                              Vazhdo përpjekjen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
          {done && (
            <>
              <div className="tool-card mb-5">
                <h2>
                  <Trophy />
                  Laboratori u përfundua!
                </h2>
                <p className="muted-text">{activeLab.res}</p>
                <Button className="mt-4" asChild>
                  <Link to="/">Kthehu te paneli</Link>
                </Button>
              </div>
              <Quiz labId={labId} />
            </>
          )}
        </div>
        <aside className="tool-card timer-card">
          <h2>
            <Clock3 />
            Kohëmatësi
          </h2>
          <div className="timer-digits">
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
            {String(elapsed % 60).padStart(2, "0")}
          </div>
          <Button
            disabled={Boolean(started) || done}
            onClick={() =>
              updateProfile((p) => ({ ...p, started: { ...p.started, [labId]: Date.now() } }))
            }
          >
            {done ? <Check /> : <Play />}
            {done ? "Përfunduar" : started ? "Seanca është aktive" : "Nis kohëmatësin"}
          </Button>
          <div className="field-row mt-5">
            <span className="eyebrow">PROGRESI</span>
            <span className="accent-text">
              {Object.keys(statuses).length}/{activeLab.steps.length}
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{ width: `${(Object.keys(statuses).length / activeLab.steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-5">
            <span className="eyebrow">ÇFARË TË DUHET</span>
            <ul>
              {activeLab.need.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <Character kind={profile.character} />
          </div>
          <details>
            <summary>Ke nevojë për ndihmë?</summary>
            {activeLab.fail.map((f) => (
              <p key={f}>{f}</p>
            ))}
          </details>
          {statuses && Object.values(statuses).includes("skipped") && (
            <p className="notice">Hapat e kaluar janë të dukshëm për ligjëruesin.</p>
          )}
        </aside>
      </div>
      {celebrate && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--confetti-left": `${i * 2.1}%`,
                  "--confetti-delay": `${(i % 7) * 0.1}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
