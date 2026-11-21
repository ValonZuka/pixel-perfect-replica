import { createFileRoute } from "@tanstack/react-router";
import { InstructorPanel } from "@/components/enigma/InstructorPanel";
import { pageHead } from "@/lib/enigma/meta";

export const Route = createFileRoute("/instructor")({
  head: () => pageHead("Paneli i ligjëruesit", "Menaxho studentët dhe pyetjet e laboratorëve."),
  component: InstructorPanel,
});
