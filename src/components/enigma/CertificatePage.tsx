import { useEffect, useState } from "react";
import { Award, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { certificateDigest } from "@/lib/enigma/certificate-hash";
import { Button } from "@/components/ui/button";
import { labs } from "@/lib/enigma/labs";
import { useLab } from "@/lib/enigma/store";

export function CertificatePage() {
  const { profile, ready } = useLab();
  const [verificationUrl, setVerificationUrl] = useState("");
  const verificationCode = profile.verificationCode ?? "";
  const complete = labs.every((lab) => profile.done.includes(lab.id));
  const approved = Boolean(profile.approvedAt);
  const digest =
    profile.completedAt && verificationCode
      ? certificateDigest({
          first: profile.first,
          last: profile.last,
          completedAt: profile.completedAt,
          verificationCode,
        })
      : "";

  useEffect(() => {
    if (verificationCode)
      setVerificationUrl(new URL(`/verify/${verificationCode}`, window.location.origin).toString());
  }, [verificationCode]);

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
            <div className="certificate-qr">
              {verificationUrl ? (
                <QRCodeSVG
                  value={verificationUrl}
                  size={100}
                  level="M"
                  aria-label={`QR për verifikimin e certifikatës ${verificationCode}`}
                />
              ) : (
                <span aria-live="polite">…</span>
              )}
              <span>VERIFIKO</span>
            </div>
          </div>
          {digest && (
            <p className="certificate-digest">
              <span className="eyebrow">HASH SHA-256</span>
              <code>{digest}</code>
            </p>
          )}
          {profile.txHash && (
            <a
              className="chain-proof-link"
              href={`${profile.polygonNetwork === "polygon" ? "https://polygonscan.com" : "https://amoy.polygonscan.com"}/tx/${profile.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              Shiko transaksionin e ankoruar në{" "}
              {profile.polygonNetwork === "polygon" ? "Polygon Mainnet" : "Polygon Amoy"}
            </a>
          )}
        </div>
      </article>
    </>
  );
}
