import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/enigma/store";
import { createStudent, loginStudent } from "@/lib/enigma/server";
import { Character, characters } from "./Character";
export function SignIn() {
  const { update } = useLab();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [character, setCharacter] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN-i duhet të ketë saktësisht 4 shifra.");
      return;
    }
    setBusy(true);
    try {
      const profile =
        mode === "login"
          ? await loginStudent({ data: { nickname, pin } })
          : await createStudent({ data: { first, last, nickname, pin, character } });
      update((current) => ({
        ...current,
        profiles: [profile],
        active: profile.id,
        role: "student",
      }));
      navigate({ to: "/" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nuk mundëm të përfundojmë hyrjen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-form-wrap">
      <div className="page-heading">
        <div>
          <h1>Çdo aventurë ka një fillim.</h1>
          <p>Partneri yt dhe blloku yt i parë po të presin.</p>
        </div>
      </div>
      <form className="profile-form" onSubmit={submit}>
        <div className="form-tabs">
          <Button
            type="button"
            variant="ghost"
            className={mode === "create" ? "selected" : ""}
            onClick={() => {
              setMode("create");
              setError("");
            }}
          >
            Krijo profil
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={mode === "login" ? "selected" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Hyr
          </Button>
        </div>
        <div className="form-grid">
          {mode === "create" && (
            <>
              <label>
                Emri
                <input
                  required
                  value={first}
                  onChange={(event) => setFirst(event.target.value)}
                  autoComplete="given-name"
                  maxLength={50}
                />
              </label>
              <label>
                Mbiemri
                <input
                  required
                  value={last}
                  onChange={(event) => setLast(event.target.value)}
                  autoComplete="family-name"
                  maxLength={50}
                />
              </label>
            </>
          )}
          <label className="form-full">
            Pseudonimi
            <input
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              autoComplete="username"
              maxLength={24}
              pattern="[A-Za-z0-9_-]{2,24}"
            />
          </label>
          {mode === "create" && (
            <div className="form-full">
              <label>Zgjidh partnerin tënd</label>
              <div className="character-picker">
                {characters.map((name, index) => (
                  <Button
                    key={name}
                    type="button"
                    variant="outline"
                    aria-pressed={character === index}
                    className={character === index ? "selected" : ""}
                    onClick={() => setCharacter(index)}
                  >
                    <Character kind={index} decorative />
                    <span>{name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="form-full">
            <label className="text-center" htmlFor="student-pin">
              PIN-i yt · 4 shifra
            </label>
            <input
              id="student-pin"
              className="pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              pattern="[0-9]{4}"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
              autoComplete={mode === "create" ? "new-password" : "current-password"}
            />
            <div className="pin-pad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "delete"].map((number) => (
                <Button
                  key={number}
                  type="button"
                  variant="secondary"
                  aria-label={
                    number === "delete" ? "Fshi shifrën" : number === "C" ? "Pastro PIN-in" : number
                  }
                  onClick={() =>
                    setPin(
                      number === "C"
                        ? ""
                        : number === "delete"
                          ? pin.slice(0, -1)
                          : (pin + number).slice(0, 4),
                    )
                  }
                >
                  {number === "delete" ? <Delete /> : number}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button className="submit-profile" type="submit" disabled={busy}>
          {busy ? "Duke u ruajtur…" : mode === "create" ? "Nis aventurën" : "Hyr në laborator"}
          <ArrowRight />
        </Button>
        <p className="notice">
          PIN-i ruhet si hash i kriptuar dhe nuk mund të rikthehet. Zgjidh një kod që mund ta mbash
          mend.
        </p>
      </form>
    </div>
  );
}
