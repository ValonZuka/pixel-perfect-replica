import { useEffect, useState } from "react";
import { Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labs } from "@/lib/enigma/labs";
import { useLab } from "@/lib/enigma/store";

export function CertificatePage() {
  const { profile, ready } = useLab();
  const [verificationCode, setVerificationCode] = useState("");
  const complete = labs.every((lab) => profile.done.includes(lab.id));
  const approved = Boolean(profile.approvedAt);

  useEffect(() => {
    if (!complete || !profile.approvedAt) return;
    const input = new TextEncoder().encode(profile.nickname + (profile.approvedAt ?? ""));
    crypto.subtle.digest("SHA-256", input).then((hash) => {
      setVerificationCode(
        Array.from(new Uint8Array(hash))
          .slice(0, 5)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase(),
      );
    });
  }, [complete, profile.approvedAt, profile.nickname]);

  if (!ready)
    return (
      <div className="tool-card" aria-busy="true">
        Po ngarkohet progresi…
      </div>
    );
  if (!complete || !approved)
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">CERTIFIKATA JOTE</span>
            <h1>Një hap larg</h1>
            <p>Përfundo laboratorët dhe prit miratimin e ligjëruesit.</p>
          </div>
        </div>
        <section className="tool-card certificate-progress">
          <div className="certificate-progress-icon">
            <Award />
          </div>
          <div>
            <span className="eyebrow">PROGRESI I KURSIT</span>
            <h2>
              {profile.done.filter((id) => labs.some((lab) => lab.id === id)).length}/7 laboratorë
            </h2>
            <div className="progress-track">
              <span
                style={{
                  width: `${Math.min(100, (profile.done.filter((id) => labs.some((lab) => lab.id === id)).length / 7) * 100)}%`,
                }}
              />
            </div>
            <p>
              {approved
                ? "Të gjithë laboratorët janë përfunduar."
                : "Në pritje të miratimit nga ligjëruesi"}
            </p>
          </div>
        </section>
      </>
    );

  const approvedDate = new Date(profile.approvedAt ?? "").toLocaleDateString("sq-AL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <>
      <div className="page-heading certificate-toolbar">
        <div>
          <span className="eyebrow">CERTIFIKATA JOTE</span>
          <h1>Arritje e merituar</h1>
          <p>Certifikata jote e përfundimit të kursit.</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer />
          Printo certifikatën
        </Button>
      </div>
      <article className="certificate" aria-label="Certifikatë e përfundimit">
        <div className="certificate-inner">
          <div className="certificate-mark">
            <Award />
          </div>
          <span className="eyebrow">CERTIFIKATË E PËRFUNDIMIT</span>
          <h1>Certifikatë</h1>
          <p className="certificate-intro">Kjo certifikatë i jepet me nderim</p>
          <h2 className="certificate-name">
            {profile.first} {profile.last}
          </h2>
          <p className="certificate-copy">për përfundimin me sukses të programit</p>
          <p className="certificate-course">Blockchain Fundamentals</p>
          <div className="certificate-bottom">
            <div className="certificate-signature">
              <span className="signature-line" />
              <strong>Ligjëruesi</strong>
              <span>Enigma Blockchain Lab</span>
            </div>
            <div className="certificate-date">
              <span className="eyebrow">DATA E MIRATIMIT</span>
              <strong>{approvedDate}</strong>
              <span className="eyebrow">KODI I VERIFIKIMIT</span>
              <strong className="verification-code">{verificationCode || "…"}</strong>
            </div>
            <div
              className="certificate-qr"
              aria-label={`QR placeholder për kodin ${verificationCode || "në përgatitje"}`}
            >
              <div className="qr-pattern" />
              <span>VERIFIKO</span>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
