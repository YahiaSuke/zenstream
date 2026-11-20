class EmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM || 'ZenStream <notifications@zenstream.local>';
  }

  async sendEmail({ to, subject, html, text }) {
    console.log(`[Email] Preparing to send to ${to}: "${subject}"`);
    if (!this.apiKey) {
      console.log(`[Email] (Mock Mode) Email queued successfully:`);
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      return { success: true, mock: true, id: `msg_mock_${Date.now()}` };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to,
          subject,
          html,
          text,
        }),
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      console.error('[Email] Failed to send email via Resend:', err);
      return { success: false, error: err.message };
    }
  }

  async sendWelcomeEmail(toUserEmail, userName) {
    return this.sendEmail({
      to: toUserEmail,
      subject: 'Welcome to ZenStream - Cinema Without the Noise',
      text: `Hello ${userName || 'Member'},\n\nWelcome to ZenStream! Your account is active. Browse our calm catalogue of high-definition films and acclaimed series with zero blaring previews and full respect for the film.\n\nEnjoy streaming,\nThe ZenStream Team`,
      html: `
        <div style="font-family: sans-serif; background: #0d1117; color: #f0f6fc; padding: 2rem;">
          <h1 style="color: #00d2c4;">Welcome to ZenStream</h1>
          <p>Cinema without the noise. Your streaming membership is active.</p>
          <p>Watch hundreds of films and series without blaring autoplays or credit cutoffs.</p>
          <a href="${process.env.APP_URL || 'http://localhost:3000'}/#/browse" style="display: inline-block; background: #00d2c4; color: #041e1b; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 1rem;">Start Watching</a>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(toUserEmail, resetToken) {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/#/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to: toUserEmail,
      subject: 'Reset your ZenStream password',
      text: `We received a request to reset your password. Use the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 60 minutes.`,
      html: `
        <div style="font-family: sans-serif; background: #0d1117; color: #f0f6fc; padding: 2rem;">
          <h2 style="color: #00d2c4;">Reset Your Password</h2>
          <p>Click the button below to choose a new password for your ZenStream account.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #00d2c4; color: #041e1b; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
