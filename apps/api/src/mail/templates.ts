import type {
  PasswordResetEmailPayload,
  VerificationEmailPayload,
} from './mail.service';

const baseStyles = `
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 24px;
  background-color: #0b111b;
  color: #f8fafc;
`;

const codeStyles = `
  font-size: 32px;
  letter-spacing: 6px;
  font-weight: 600;
  display: inline-block;
  margin: 24px 0;
`;

const paragraphStyles = `
  font-size: 16px;
  line-height: 1.6;
  color: #cbd5f5;
`;

const footerStyles = `
  margin-top: 32px;
  font-size: 13px;
  color: #94a3b8;
`;

export function verificationEmailTemplate(payload: VerificationEmailPayload) {
  const subject = 'Verify your Vanx email';
  const html = `
    <div style="${baseStyles}">
      <h1>Welcome to Vanx, ${payload.name || 'there'}!</h1>
      <p style="${paragraphStyles}">
        Use the code below to verify your email address and finish creating your account.
      </p>
      <div style="${codeStyles}">${payload.code}</div>
      <p style="${paragraphStyles}">
        This code expires in 10 minutes. If you did not request it, you can safely ignore this email.
      </p>
      <p style="${footerStyles}">Sent securely by Vanx.</p>
    </div>
  `;
  const text = `Verify your Vanx email with this code: ${payload.code}. It expires in 10 minutes.`;
  return { subject, html, text };
}

export function passwordResetTemplate(payload: PasswordResetEmailPayload) {
  const subject = 'Reset your Vanx password';
  const html = `
    <div style="${baseStyles}">
      <h1>Reset password</h1>
      <p style="${paragraphStyles}">
        Hi ${payload.name || 'there'}, enter the code below to reset your Vanx password.
      </p>
      <div style="${codeStyles}">${payload.code}</div>
      <p style="${paragraphStyles}">
        The code expires in 10 minutes. If you didn't request this, no action is needed.
      </p>
      <p style="${footerStyles}">Need help? Reply to this email.</p>
    </div>
  `;
  const text = `Reset your Vanx password with this code: ${payload.code}. The code expires in 10 minutes.`;
  return { subject, html, text };
}
