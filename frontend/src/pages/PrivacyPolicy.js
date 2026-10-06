import { useEffect } from "react";

const sectionStyle = { marginBottom: 30 };
const h2Style = { fontSize: 22, lineHeight: 1.3, margin: "0 0 10px", color: "#0A1628", letterSpacing: "-.3px" };
const pStyle = { fontSize: 15, lineHeight: 1.75, margin: "0 0 10px", color: "#4B6280" };
const liStyle = { fontSize: 15, lineHeight: 1.75, marginBottom: 6, color: "#4B6280" };

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy | Bsquare Club";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC", color: "#0A1628" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #E2EBF5" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 22px", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Bsquare Club" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.4px" }}>Bsquare Club</div>
            <div style={{ fontSize: 11, color: "#8AACC8", marginTop: 1 }}>Privacy Policy</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 22px 72px" }}>
        <div style={{ background: "#fff", border: "1px solid #E2EBF5", borderRadius: 20, padding: "clamp(24px,5vw,52px)", boxShadow: "0 8px 32px rgba(10,22,40,.05)" }}>
          <div style={{ marginBottom: 38 }}>
            <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: "#EEF6FF", color: "#1878C8", fontSize: 11, fontWeight: 700, marginBottom: 16 }}>Effective 6 October 2026</div>
            <h1 style={{ fontSize: "clamp(34px,6vw,54px)", lineHeight: 1.04, margin: "0 0 16px", letterSpacing: "-1.7px" }}>Privacy Policy</h1>
            <p style={{ ...pStyle, fontSize: 16 }}>
              This Privacy Policy explains how Bsquare Club ("Bsquare", "we", "our", or "us") collects, uses, stores, and shares information when you use our website, mobile application, and related services.
            </p>
          </div>

          <section style={sectionStyle}>
            <h2 style={h2Style}>1. Information we collect</h2>
            <p style={pStyle}>Depending on how you use Bsquare, we may collect the following categories of information:</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li style={liStyle}><strong>Account information:</strong> name, email address, phone number, password credentials in hashed form, account status, and user identifier.</li>
              <li style={liStyle}><strong>Business and professional information:</strong> business name, role, industry, city, business bio, company size, year founded, business interests, goals, and connection preferences.</li>
              <li style={liStyle}><strong>Verification information:</strong> information submitted for business or professional verification, such as DIN-related details, succession information, or a LinkedIn profile URL.</li>
              <li style={liStyle}><strong>Profile content:</strong> profile photos, business logos, business images, and other content you choose to upload.</li>
              <li style={liStyle}><strong>Location information:</strong> precise or approximate location, when you grant permission, to support nearby business discovery and distance-based features.</li>
              <li style={liStyle}><strong>Connections and communications:</strong> connection requests, accepted connections, messages, and related interaction data.</li>
              <li style={liStyle}><strong>Technical information:</strong> device, browser, operating-system, log, diagnostic, and security information generated when you use the service.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>2. How we use information</h2>
            <p style={pStyle}>We use information to provide and operate Bsquare, including to:</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li style={liStyle}>create and manage accounts and profiles;</li>
              <li style={liStyle}>review verification submissions and maintain a trusted business network;</li>
              <li style={liStyle}>show relevant professionals, businesses, connections, and events;</li>
              <li style={liStyle}>support nearby discovery and calculate relative distance;</li>
              <li style={liStyle}>enable connection requests, messaging, and other networking features;</li>
              <li style={liStyle}>provide customer support, troubleshoot issues, and improve reliability;</li>
              <li style={liStyle}>detect abuse, fraud, security incidents, and violations of our terms;</li>
              <li style={liStyle}>comply with legal obligations and enforce our rights.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>3. Location data</h2>
            <p style={pStyle}>
              If you allow location access, Bsquare may use your device location while the service is in use to provide nearby discovery and distance-based recommendations. You can control location permission through your device settings. If location access is unavailable, certain features may use a city-level location or may be limited.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>4. How we share information</h2>
            <p style={pStyle}>We do not sell your personal information. We may share information only as needed for the service, including:</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li style={liStyle}><strong>With other users:</strong> profile and business information you make available through Bsquare, and contact details when a connection or feature is designed to reveal them.</li>
              <li style={liStyle}><strong>With service providers:</strong> hosting, infrastructure, authentication, storage, email, security, analytics, and other vendors that process data on our behalf.</li>
              <li style={liStyle}><strong>For legal or safety reasons:</strong> when required by law, legal process, or to protect users, Bsquare, or the public.</li>
              <li style={liStyle}><strong>Business transfers:</strong> if Bsquare is involved in a merger, acquisition, financing, reorganisation, or sale of assets.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>5. Third-party sign-in and services</h2>
            <p style={pStyle}>
              Bsquare may support third-party authentication or links, including Sign in with Apple and LinkedIn-related functionality. Those providers may process information under their own privacy policies. We encourage you to review their terms and privacy practices.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>6. Data retention</h2>
            <p style={pStyle}>
              We retain personal information for as long as reasonably necessary to provide the service, maintain security, resolve disputes, meet legal obligations, and enforce agreements. Retention periods may vary by data type and legal requirement. When information is no longer required, we may delete or anonymise it.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>7. Your choices and rights</h2>
            <p style={pStyle}>
              Depending on your location, you may have rights to access, correct, delete, or restrict certain uses of your personal information. You can update profile information through the app where available, manage device permissions in your settings, and request account deletion through the app or by contacting us.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>8. Account deletion</h2>
            <p style={pStyle}>
              If you delete your account, we will begin deleting or de-identifying personal information associated with your account, subject to information we must retain for legal, security, fraud-prevention, dispute-resolution, or other legitimate purposes.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>9. Security</h2>
            <p style={pStyle}>
              We use reasonable administrative, technical, and organisational safeguards designed to protect information. No method of electronic storage or transmission is completely secure, so we cannot guarantee absolute security.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>10. Children</h2>
            <p style={pStyle}>
              Bsquare is intended for business and professional networking and is not directed to children. We do not knowingly collect personal information from children in violation of applicable law. If you believe a child has provided personal information to us, please contact us.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>11. International processing</h2>
            <p style={pStyle}>
              Your information may be processed in countries other than the country where you live. Where required, we take steps intended to ensure appropriate safeguards for international data transfers.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={h2Style}>12. Changes to this policy</h2>
            <p style={pStyle}>
              We may update this Privacy Policy from time to time. We will post the updated version on this page and revise the effective date. Material changes may also be communicated through the service where appropriate.
            </p>
          </section>

          <section style={{ ...sectionStyle, marginBottom: 0 }}>
            <h2 style={h2Style}>13. Contact us</h2>
            <p style={pStyle}>For privacy questions, requests, or concerns, contact:</p>
            <p style={{ ...pStyle, marginBottom: 4 }}><strong>Bsquare Club</strong></p>
            <p style={{ ...pStyle, marginBottom: 0 }}><a href="mailto:support@bsquare.club" style={{ color: "#1878C8", textDecoration: "none", fontWeight: 700 }}>support@bsquare.club</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
