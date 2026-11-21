import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Blocks, ShieldAlert } from "lucide-react";
import { publicCertificate } from "@/lib/enigma/server";
import { pageHead } from "@/lib/enigma/meta";
import { certificateDigest } from "@/lib/enigma/certificate-hash";
import { labs } from "@/lib/enigma/labs";

export const Route = createFileRoute("/verify/$code")({
  loader: ({ params }) => publicCertificate({ data: { code: params.code } }),
  head: () =>
    pageHead(
      "Verifikimi i certifikatës",
      "Verifiko certifikatën e kursit Blockchain Fundamentals.",
    ),
  component: VerifyCertificate,
});

function VerifyCertificate() {
  const certificate = Route.useLoaderData();
  if (!certificate) {
    return (
      <section className="tool-card certificate-progress" role="status">
        <ShieldAlert aria-hidden="true" />
        <div>
          <h1>Certifikata nuk u gjet</h1>
          <p>Kodi i verifikimit është i pasaktë ose certifikata nuk është miratuar.</p>
        </div>
      </section>
    );
  }

  const digest = certificateDigest({
    first: certificate.first,
    last: certificate.last,
    completedAt: certificate.completedAt,
    verificationCode: certificate.verificationCode,
  });
  const completedLabs = labs.filter((lab) => certificate.done.includes(lab.id));

  return (
    <article className="certificate-verify-card">
      <div className="certificate-mark">
        <BadgeCheck aria-hidden="true" />
      </div>
      <span className="eyebrow">VERIFIKIM ZYRTAR</span>
      <h1>Certifikata është e vlefshme</h1>
      <p className="certificate-intro">Blockchain Fundamentals · Enigma Blockchain Lab</p>
      <h2 className="certificate-name">
        {certificate.first} {certificate.last}
      </h2>
      <p>
        Përfunduar më{" "}
        {new Date(certificate.completedAt).toLocaleDateString("sq-AL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p>
        Miratuar më{" "}
        {new Date(certificate.approvedAt).toLocaleDateString("sq-AL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p className="verification-code">Kodi: {certificate.verificationCode}</p>
      <section className="certificate-labs" aria-label="Laboratorët e përfunduar">
        <h2>
          {completedLabs.length}/{labs.length} laboratorë të përfunduar
        </h2>
        <ul>
          {completedLabs.map((lab) => (
            <li key={lab.id}>{lab.t}</li>
          ))}
        </ul>
      </section>
      <div className="certificate-digest">
        <span className="eyebrow">HASH SHA-256 I CERTIFIKATËS</span>
        <code>{digest}</code>
      </div>
      {certificate.txHash && (
        <a
          className="chain-proof-link"
          href={`${certificate.polygonNetwork === "polygon" ? "https://polygonscan.com" : "https://amoy.polygonscan.com"}/tx/${certificate.txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <Blocks aria-hidden="true" /> Shiko ankorimin në{" "}
          {certificate.polygonNetwork === "polygon" ? "Polygon Mainnet" : "Polygon Amoy"}
        </a>
      )}
    </article>
  );
}
