import { useLab, type Question } from "@/lib/enigma/store";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Check, X } from "lucide-react";

export function Quiz({ labId }: { labId: string }) {
  const { data, profile, updateProfile } = useLab();
  const defaults: Question[] = [
    {
      id: "hash",
      lab: labId,
      text: "Sa karaktere hex ka një hash SHA-256?",
      options: ["32 karaktere", "64 karaktere", "256 karaktere"],
      answer: 1,
    },
    {
      id: "merkle",
      lab: labId,
      text: "Çfarë ndodh me Merkle root kur ndryshon një transaksion?",
      options: ["Mbetet i njëjtë", "Ndryshon vetëm një shkronjë", "Ndryshon i gjithë root-i"],
      answer: 2,
    },
    {
      id: "wallet",
      lab: labId,
      text: "Me kë mund ta ndash seed phrase?",
      options: ["Me asnjë", "Me ligjëruesin", "Me një koleg të besuar"],
      answer: 0,
    },
  ];
  const questions = [...defaults, ...data.questions.filter((question) => question.lab === labId)];
  const answers = profile.quizzes[labId] ?? [];
  const isAnswered = (value: number | null | undefined) => typeof value === "number";

  function answer(index: number, value: number) {
    updateProfile((current) => {
      if (isAnswered(current.quizzes[labId]?.[index])) return current;
      const answers = [...(current.quizzes[labId] ?? [])];
      answers[index] = value;
      const question = questions[index];
      return {
        ...current,
        quizzes: { ...current.quizzes, [labId]: answers },
        xp: current.xp + (question?.answer === value && index < defaults.length ? 1 : 0),
      };
    });
  }

  return (
    <section className="tool-card">
      <h2>
        <BrainCircuit /> Kuizi i seancës
      </h2>
      <span className="eyebrow">{questions.length} PYETJE · +1 XP PËR PËRGJIGJE TË SAKTË</span>
      {questions.map((question, index) => {
        const selected = answers[index];
        const answered = isAnswered(selected);
        return (
          <div className="quiz-question" key={question.id}>
            <h3>
              {index + 1}. {question.text}
            </h3>
            {question.options.map((option, optionIndex) => (
              <Button
                key={option}
                variant="outline"
                className={`quiz-option ${answered && optionIndex === question.answer ? "correct" : selected === optionIndex ? "incorrect" : ""}`}
                disabled={answered}
                onClick={() => answer(index, optionIndex)}
              >
                <span>{String.fromCharCode(65 + optionIndex)}.</span>
                {option}
                {selected === optionIndex && (optionIndex === question.answer ? <Check /> : <X />)}
              </Button>
            ))}
            {answered && (
              <p className="feedback">
                {selected === question.answer
                  ? "Saktë! +1 XP"
                  : `Përgjigjja e saktë: ${question.options[question.answer]}`}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
