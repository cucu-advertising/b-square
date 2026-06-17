const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_URL = process.env.CLIENT_URL || "http://localhost:3000";
const FROM = `"B Square" <${process.env.EMAIL_USER}>`;

const sendApprovalEmail = async (user) => {
  if (!process.env.EMAIL_USER) return;
  const verLabel = { din: "DIN Verified", linkedin: "LinkedIn Verified", succession: "Business Succession Verified" };
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2EBF8}
  .header{background:#1251A3;padding:28px 32px;text-align:center}
  .logo{display:inline-block;width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:11px;line-height:44px;font-size:18px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:10px}
  .brand{font-size:20px;font-weight:700;color:#fff;font-family:Georgia,serif}
  .body{padding:32px}
  .check{width:60px;height:60px;background:#EAF5EE;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 18px}
  h1{font-family:Georgia,serif;font-size:24px;font-weight:700;color:#0A1628;text-align:center;margin:0 0 10px}
  p{font-size:14px;color:#4A6FA5;line-height:1.7;text-align:center;margin:0 0 24px;font-weight:500}
  .details{background:#F0F4FF;border-radius:12px;padding:16px 20px;margin-bottom:24px}
  .details-title{font-size:11px;font-weight:700;color:#1251A3;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px}
  table{width:100%;font-size:13px;border-collapse:collapse}
  td{padding:5px 0;vertical-align:top}
  .label{color:#7A90B0;font-weight:500;width:120px}
  .value{color:#0A1628;font-weight:700;text-align:right}
  .cta{display:block;width:200px;margin:0 auto 24px;padding:14px 0;background:#1251A3;color:#fff;text-align:center;border-radius:11px;font-size:14px;font-weight:700;text-decoration:none}
  .footer{border-top:1px solid #E2EBF8;padding-top:18px;font-size:12px;color:#9EB0CC;text-align:center;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">B²</div>
    <div class="brand">B Square</div>
  </div>
  <div class="body">
    <div class="check" style="display:table;margin:0 auto 18px"><div style="display:table-cell;vertical-align:middle;text-align:center;font-size:26px">✓</div></div>
    <h1>You're approved!</h1>
    <p>Hi <strong style="color:#0A1628">${user.founder_name || user.name}</strong>, your B Square account has been verified and approved. You now have full access to connect with verified businesses near you.</p>
    <div class="details">
      <div class="details-title">Your account</div>
      <table>
        <tr><td class="label">Business</td><td class="value">${user.name}</td></tr>
        <tr><td class="label">Verification</td><td class="value">${verLabel[user.verification_type] || "Verified"}</td></tr>
        <tr><td class="label">City</td><td class="value">${user.city || "—"}</td></tr>
        <tr><td class="label">Status</td><td class="value" style="color:#1A6B38">Active ✓</td></tr>
      </table>
    </div>
    <a href="${APP_URL}/login" class="cta">Sign In to B Square →</a>
    <div class="footer">
      You're receiving this because you registered on B Square.<br>
      Questions? Reply to this email or contact <a href="mailto:admin@bsquare.in" style="color:#1251A3">admin@bsquare.in</a>
    </div>
  </div>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: "🎉 Your B Square account is approved — Welcome!",
    html,
  });
};

const sendRejectionEmail = async (user, reason) => {
  if (!process.env.EMAIL_USER) return;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2EBF8}
  .header{background:#1251A3;padding:28px 32px;text-align:center}
  .logo{display:inline-block;width:44px;height:44px;background:rgba(255,255,255,0.15);border-radius:11px;line-height:44px;font-size:18px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:10px}
  .brand{font-size:20px;font-weight:700;color:#fff;font-family:Georgia,serif}
  .body{padding:32px}
  h1{font-family:Georgia,serif;font-size:22px;font-weight:700;color:#0A1628;text-align:center;margin:0 0 10px}
  p{font-size:14px;color:#4A6FA5;line-height:1.7;text-align:center;margin:0 0 20px;font-weight:500}
  .reason-box{background:#FFF5F5;border:1px solid #F7C1C1;border-radius:12px;padding:16px 20px;margin-bottom:20px}
  .reason-title{font-size:11px;font-weight:700;color:#A32D2D;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px}
  .reason-text{font-size:13px;color:#791F1F;line-height:1.65;font-weight:500}
  .steps{background:#F0F4FF;border-radius:12px;padding:16px 20px;margin-bottom:24px}
  .steps-title{font-size:11px;font-weight:700;color:#1251A3;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px}
  .step{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:#0A1628;font-weight:500;margin-bottom:8px}
  .step-num{color:#1251A3;font-weight:700;flex-shrink:0}
  .cta{display:block;width:200px;margin:0 auto 24px;padding:14px 0;background:#1251A3;color:#fff;text-align:center;border-radius:11px;font-size:14px;font-weight:700;text-decoration:none}
  .footer{border-top:1px solid #E2EBF8;padding-top:18px;font-size:12px;color:#9EB0CC;text-align:center;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">B²</div>
    <div class="brand">B Square</div>
  </div>
  <div class="body">
    <div style="width:56px;height:56px;background:#FFF0F0;border-radius:50%;margin:0 auto 18px;display:table">
      <div style="display:table-cell;vertical-align:middle;text-align:center;font-size:22px;color:#D44">✕</div>
    </div>
    <h1>Verification unsuccessful</h1>
    <p>Hi <strong style="color:#0A1628">${user.founder_name || user.name}</strong>, we were unable to verify your account at this time. Here's what happened and how to fix it.</p>
    <div class="reason-box">
      <div class="reason-title">Reason for rejection</div>
      <div class="reason-text">${reason}</div>
    </div>
    <div class="steps">
      <div class="steps-title">What to do next</div>
      <div class="step"><span class="step-num">1.</span><span>Review the reason above carefully</span></div>
      <div class="step"><span class="step-num">2.</span><span>Correct the information (check mca.gov.in for DIN issues)</span></div>
      <div class="step"><span class="step-num">3.</span><span>Re-register with the updated details</span></div>
      <div class="step"><span class="step-num">4.</span><span>Reply to this email if you need help from our team</span></div>
    </div>
    <a href="${APP_URL}/register" class="cta">Re-apply on B Square →</a>
    <div class="footer">
      Questions? Reply to this email — our team will help within 24 hours.<br>
      B Square Support · <a href="mailto:admin@bsquare.in" style="color:#1251A3">admin@bsquare.in</a>
    </div>
  </div>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: "B Square — Account verification update",
    html,
  });
};

module.exports = { sendApprovalEmail, sendRejectionEmail };
