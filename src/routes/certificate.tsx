import { createFileRoute } from "@tanstack/react-router";
import { CertificatePage } from "@/components/enigma/CertificatePage";
import { pageHead } from "@/lib/enigma/meta";

export const Route = createFileRoute("/certificate")({
  head: () =>
    pageHead("Certifikata", "Shiko progresin ose printo certifikatën Blockchain Fundamentals."),
  component: CertificatePage,
});
