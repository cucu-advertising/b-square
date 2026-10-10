import { useEffect } from "react";

const s = {
  page: { minHeight: "100vh", background: "#F5F8FC", color: "#0A1628" },
  wrap: { maxWidth: 900, margin: "0 auto", padding: "56px 22px 72px" },
  card: { background: "#fff", border: "1px solid #E2EBF5", borderRadius: 20, padding: "clamp(24px,5vw,52px)", boxShadow: "0 8px 32px rgba(10,22,40,.05)" },
  h2: { fontSize: 22, lineHeight: 1.3, margin: "0 0 10px", color: "#0A1628", letterSpacing: "-.3px" },
  p: { fontSize: 15, lineHeight: 1.75, margin: "0 0 10px", color: "#4B6280" },
  li: { fontSize: 15, lineHeight: 1.75, marginBottom: 8, color: "#4B6280" }
};

export default function DeleteAccount() {
  useEffect(() => {
    document.title = "Delete Account | Bsquare Club";
    window.scrollTo(0, 0);
  }, []);

  const subject = encodeURIComponent("Bsquare Club account deletion request");
  const body = encodeURIComponent(
    "Hello Bsquare Club Support,\n\nI would like to request deletion of my Bsquare Club account and associated personal data.\n\nRegistered email or phone: \nFull name: \n\nThank you."
  );

  return (
    <div style={s.page}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E2EBF5" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Bsquare Club" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.4px" }}>Bsquare Club</div>
            <div style={{ fontSize: 11, color: "#8AACC8", marginTop: 1 }}>by Cucu Advertising</div>
          </div>
        </div>
      </header>

      <main style={s.wrap}>
        <div style={s.card}>
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#EEF6FF", color: "#1878C8", fontSize: 11, fontWeight: 700, marginBottom: 16 }}>
              ACCOUNT & DATA DELETION
            </div>
            <h1 style={{ fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, margin: "0 0 16px", letterSpacing: "-1.5px" }}>
              Delete your Bsquare Club account
            </h1>
            <p style={{ ...s.p, fontSize: 16 }}>
              Bsquare Club (B Square), operated by Cucu Advertising, lets users request deletion of their account and associated personal data.
            </p>
          </div>

          <section style={{ marginBottom: 30 }}>
            <h2 style={s.h2}>How to request deletion</h2>
            <ol style={{ paddingLeft: 22, margin: "0 0 18px" }}>
              <li style={s.li}>Click the <strong>Request account deletion</strong> button below.</li>
              <li style={s.li}>Send the email from the email address linked to your Bsquare Club account, where possible.</li>
              <li style={s.li}>Include your registered email address or phone number and your full name so we can identify the correct account.</li>
              <li style={s.li}>We may contact you to verify ownership before processing the request.</li>
            </ol>

            <a
              href={`mailto:support@bsquare.club?subject=${subject}&body=${body}`}
              style={{
                display: "inline-block",
                background: "#1878C8",
                color: "#fff",
                padding: "13px 18px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none"
              }}
            >
              Request account deletion
            </a>

            <p style={{ ...s.p, marginTop: 14, marginBottom: 0 }}>
              You can also email <a href="mailto:support@bsquare.club" style={{ color: "#1878C8", fontWeight: 700, textDecoration: "none" }}>support@bsquare.club</a> with the subject <strong>“Bsquare Club account deletion request.”</strong>
            </p>
          </section>

          <section style={{ marginBottom: 30 }}>
            <h2 style={s.h2}>Data deleted with your account</h2>
            <p style={s.p}>After we verify and approve the request, we will delete or de-identify data associated with the account, including where applicable:</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li style={s.li}>account details such as name, email address, phone number, and user ID;</li>
              <li style={s.li}>profile and business information, including business name, role, bio, industry, interests, goals, and connection preferences;</li>
              <li style={s.li}>profile photos, business logos, and other images uploaded to the account;</li>
              <li style={s.li}>saved location information associated with nearby discovery;</li>
              <li style={s.li}>connection requests and connection records associated with the account;</li>
              <li style={s.li}>messages and other user content associated with the account, subject to the retention exceptions below;</li>
              <li style={s.li}>verification information submitted for review, unless retention is required for legal, fraud-prevention, or security reasons.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 30 }}>
            <h2 style={s.h2}>Data that may be retained</h2>
            <p style={s.p}>
              We may retain a limited amount of information where necessary to meet legal obligations, prevent fraud or abuse, resolve disputes, enforce our agreements, maintain security, or keep required financial and audit records.
            </p>
            <p style={s.p}>
              Where retention is required, the information is kept only for as long as necessary for the applicable legal, security, dispute-resolution, or compliance purpose, after which it is deleted or anonymised.
            </p>
          </section>

          <section style={{ marginBottom: 30 }}>
            <h2 style={s.h2}>Processing time</h2>
            <p style={s.p}>
              We aim to process verified account deletion requests within 30 days. In some cases, applicable law or a legitimate security or compliance requirement may require additional time. If so, we will provide an update where appropriate.
            </p>
          </section>

          <section style={{ marginBottom: 30 }}>
            <h2 style={s.h2}>What happens after deletion</h2>
            <p style={s.p}>
              Once the deletion process is completed, you will no longer be able to sign in to the deleted Bsquare Club account, and deleted data cannot normally be restored.
            </p>
          </section>

          <section style={{ marginBottom: 0 }}>
            <h2 style={s.h2}>Need help?</h2>
            <p style={{ ...s.p, marginBottom: 0 }}>
              Contact Bsquare Club at <a href="mailto:support@bsquare.club" style={{ color: "#1878C8", fontWeight: 700, textDecoration: "none" }}>support@bsquare.club</a>.
              You can also review our <a href="/privacy-policy" style={{ color: "#1878C8", fontWeight: 700, textDecoration: "none" }}>Privacy Policy</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
