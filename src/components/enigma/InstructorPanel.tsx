import { useState } from "react";
import { Check, KeyRound, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLab, skippedCount, type Question } from "@/lib/enigma/store";
import { labs } from "@/lib/enigma/labs";

export function InstructorPanel() {
  const { data, update, updateProfile } = useLab();
  const [sessions, setSessions] = useState<Record<string, string>>({});
  const [lab, setLab] = useState(labs[0]?.id ?? "");
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [notice, setNotice] = useState("");

  if (data.role !== "instructor") {
    return (
      <section className="tool-card">
        <h2>Paneli i ligjëruesit</h2>
        <p>Ky panel është i disponueshëm vetëm për ligjëruesit.</p>
      </section>
    );
  }

  function openSession(studentId: string) {
    const session = sessions[studentId] ?? labs[0]?.id;
    if (!session) return;
    update((d) => ({
      ...d,
      profiles: d.profiles.map((p) =>
        p.id === studentId
          ? { ...p, unlocked: p.unlocked.includes(session) ? p.unlocked : [...p.unlocked, session] }
          : p,
      ),
    }));
    const student = data.profiles.find((p) => p.id === studentId);
    setNotice(
      `Seanca ${labs.find((item) => item.id === session)?.s ?? ""} u hap për ${student?.first ?? "studentin"}.`,
    );
  }

  function resetPin(id: string) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    updateProfile((p) => ({ ...p, pin }), id);
    const student = data.profiles.find((p) => p.id === id);
    setNotice(`PIN-i i ri për ${student?.first ?? "studentin"}: ${pin}`);
  }

  function approve(id: string) {
    updateProfile((p) => ({ ...p, approvedAt: new Date().toISOString() }), id);
  }

  function addQuestion() {
    const text = questionText.trim();
    const options = answers.map((answer) => answer.trim()).filter(Boolean);
    if (!text || options.length < 2 || options.length > 4 || !lab) return;
    const question: Question = { id: crypto.randomUUID(), lab, text, options, answer: 0 };
    update((d) => ({ ...d, questions: [...d.questions, question] }));
    setQuestionText("");
    setAnswers(["", ""]);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MENAXHIMI I KURSIT</span>
          <h1>Paneli i ligjëruesit</h1>
          <p>Mbështet studentët, hap seanca dhe menaxho pyetjet e kuizeve.</p>
        </div>
        <div className="cohort">
          <Users /> {data.profiles.length} studentë
        </div>
      </div>
      {notice && (
        <p className="instructor-notice" role="status">
          {notice}
        </p>
      )}
      <section className="tool-card instructor-students">
        <div className="section-heading">
          <div>
            <h2>
              <Users />
              Studentët
            </h2>
            <p>Progresi, hapat e kaluar dhe miratimet e certifikatave.</p>
          </div>
        </div>
        <div className="instructor-table-wrap">
          <table className="instructor-table">
            <thead>
              <tr>
                <th>Studenti</th>
                <th>XP</th>
                <th>Laboratorë</th>
                <th>Hapa të kaluar</th>
                <th>Seanca</th>
                <th>Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {data.profiles.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>
                      {student.first} {student.last}
                    </strong>
                    <small>@{student.nickname}</small>
                  </td>
                  <td>{student.xp} XP</td>
                  <td>{student.done.length}/7</td>
                  <td>
                    <span className="skipped-count">{skippedCount(student)}</span>
                  </td>
                  <td>
                    <div className="instructor-session-row">
                      <label className="sr-only" htmlFor={`session-${student.id}`}>
                        Seanca për {student.first} {student.last}
                      </label>
                      <select
                        id={`session-${student.id}`}
                        value={sessions[student.id] ?? labs[0]?.id ?? ""}
                        onChange={(event) =>
                          setSessions((current) => ({
                            ...current,
                            [student.id]: event.target.value,
                          }))
                        }
                      >
                        {labs.map((item) => (
                          <option key={item.id} value={item.id}>
                            Seanca {item.s} · {item.t}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => openSession(student.id)}>
                        Hap seancën
                      </Button>
                    </div>
                  </td>
                  <td>
                    <div className="instructor-actions">
                      <Button size="sm" variant="outline" onClick={() => resetPin(student.id)}>
                        <KeyRound />
                        Reset PIN
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approve(student.id)}
                        disabled={Boolean(student.approvedAt)}
                      >
                        {student.approvedAt ? <Check /> : null}
                        {student.approvedAt ? "Aprovuar" : "Aprovo certifikatën"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="tool-card instructor-questions">
        <div className="section-heading">
          <div>
            <h2>
              <Plus />
              Redaktori i pyetjeve
            </h2>
            <p>Përgjigjja e parë ruhet si përgjigjja e saktë.</p>
          </div>
        </div>
        <div className="question-editor">
          <label>
            Laboratori
            <select value={lab} onChange={(event) => setLab(event.target.value)}>
              {labs.map((item) => (
                <option key={item.id} value={item.id}>
                  Seanca {item.s} · {item.t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Teksti i pyetjes
            <input
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Shkruaj pyetjen"
            />
          </label>
          <div className="question-answer-fields">
            <span className="eyebrow">PËRGJIGJET · E PARA ËSHTË E SAKTË</span>
            {answers.map((answer, index) => (
              <div className="question-answer-row" key={index}>
                <label className="sr-only" htmlFor={`answer-${index}`}>
                  Përgjigjja {index + 1}
                  {index === 0 ? " (e saktë)" : ""}
                </label>
                <input
                  id={`answer-${index}`}
                  value={answer}
                  onChange={(event) =>
                    setAnswers((current) =>
                      current.map((value, answerIndex) =>
                        answerIndex === index ? event.target.value : value,
                      ),
                    )
                  }
                  placeholder={`Përgjigjja ${index + 1}${index === 0 ? " · e saktë" : ""}`}
                />
                {answers.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hiq përgjigjen ${index + 1}`}
                    onClick={() =>
                      setAnswers((current) =>
                        current.filter((_, answerIndex) => answerIndex !== index),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))}
            {answers.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnswers((current) => [...current, ""])}
              >
                <Plus />
                Shto përgjigje
              </Button>
            )}
          </div>
          <Button
            onClick={addQuestion}
            disabled={!questionText.trim() || answers.filter((value) => value.trim()).length < 2}
          >
            Shto pyetjen
          </Button>
        </div>
        <div className="question-list">
          {data.questions.map((question) => (
            <article className="question-list-item" key={question.id}>
              <div>
                <span className="eyebrow">
                  {labs.find((item) => item.id === question.lab)?.t ?? "Laborator"}
                </span>
                <h3>{question.text}</h3>
                <p>
                  {question.options.map((option, index) => (
                    <span
                      className={index === 0 ? "correct-answer" : ""}
                      key={`${question.id}-${option}`}
                    >
                      {index === 0 ? "✓ " : ""}
                      {option}
                    </span>
                  ))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Fshi pyetjen: ${question.text}`}
                onClick={() =>
                  update((d) => ({
                    ...d,
                    questions: d.questions.filter((item) => item.id !== question.id),
                  }))
                }
              >
                <Trash2 />
              </Button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
