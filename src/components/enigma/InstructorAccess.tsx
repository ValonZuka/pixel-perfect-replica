import { useState, type FormEvent } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { instructorProfiles, loginInstructor } from "@/lib/enigma/server";
import { useLab } from "@/lib/enigma/store";

export function InstructorAccess() {
  const { update } = useLab();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginInstructor({ data: { pin } });
      const records = await instructorProfiles();
      update((current) => ({
        ...current,
        profiles: records.map((record) => record.profile),
        active: records[0]?.profile.id ?? "",
        role: "instructor",
      }));
      setOpen(false);
      setPin("");
      navigate({ to: "/instructor" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hyrja dështoi. Provo përsëri.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="role-switch-trigger">
          <GraduationCap /> Ligjërues
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hyrja e ligjëruesit</DialogTitle>
          <DialogDescription>
            Shkruaj PIN-in privat për të hapur panelin e klasës.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <label htmlFor="instructor-pin" className="text-sm font-medium">
            PIN-i i ligjëruesit
          </label>
          <Input
            id="instructor-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            pattern="[0-9]{4}"
            maxLength={4}
            required
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
          />
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Duke verifikuar…" : "Hyr në panel"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
