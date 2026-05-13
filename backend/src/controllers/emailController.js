import 'dotenv/config';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const parseBoolean = (value) => String(value).toLowerCase() === 'true';

const getEmailConfig = () => {
  const sendGridFrom = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || process.env.DEFAULT_FROM_EMAIL;

  if (process.env.SENDGRID_API_KEY && sendGridFrom) {
    return {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      from: sendGridFrom
    };
  }

  if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS) {
    return {
      provider: 'smtp',
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.BREVO_SMTP_PORT || 587),
      secure: parseBoolean(process.env.BREVO_SMTP_SECURE),
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
      },
      from: process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER
    };
  }

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      provider: 'smtp',
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: parseBoolean(process.env.EMAIL_SECURE),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER
    };
  }

  return null;
};

const createTransporter = () => {
  const config = getEmailConfig();

  if (!config) {
    throw new Error('Email transport is not configured. Set SENDGRID_API_KEY + EMAIL_FROM, BREVO_SMTP_*, or EMAIL_* environment variables.');
  }

  if (config.provider === 'sendgrid') {
    sgMail.setApiKey(config.apiKey);
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });
};

const getFromAddress = () => {
  const config = getEmailConfig();
  return config?.from || 'noreply@meritlives.com';
};

const sendMessage = async (message) => {
  createTransporter();
  const config = getEmailConfig();
  const payload = {
    ...message,
    from: message.from || getFromAddress(),
  };

  if (config?.provider === 'sendgrid') {
    await sgMail.send(payload);
  } else {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });
    await transporter.sendMail(payload);
  }
};

export const sendMailWithTemplate = async ({
  to,
  subject,
  headline,
  recipientName,
  intro,
  body,
  ctaLabel,
  ctaUrl,
}) => {
  const safeHeadline = headline || subject || 'Meritlives notification';
  const safeIntro = intro || 'You have a new update in your workspace.';
  const safeBody = body || safeIntro;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
      <div style="padding: 24px 28px; background: linear-gradient(135deg, #0f3d91, #1d4ed8); color: #ffffff;">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85;">Meritlives AI Tools</p>
        <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">${safeHeadline}</h1>
      </div>
      <div style="padding: 28px;">
        <p style="font-size: 16px; line-height: 1.7; margin-top: 0;">Hello ${recipientName || 'there'},</p>
        <p style="font-size: 15px; line-height: 1.8; color: #475569;">${safeIntro}</p>
        <p style="font-size: 15px; line-height: 1.8; color: #475569;">${safeBody}</p>
        ${ctaLabel && ctaUrl ? `
          <div style="margin: 28px 0;">
            <a href="${ctaUrl}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: 700;">
              ${ctaLabel}
            </a>
          </div>
        ` : ''}
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">You are receiving this because notifications are enabled on your Meritlives account.</p>
      </div>
    </div>
  `;

  await sendMessage({
    to,
    subject,
    text: `${safeHeadline}\n\n${safeIntro}\n\n${safeBody}${ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ''}`,
    html,
  });

  return true;
};

export const sendPlainEmail = async ({ to, subject, text, html, replyTo }) => {
  await sendMessage({
    to,
    subject,
    text: text || '',
    html: html || `<div style="font-family: Arial, sans-serif; color: #1f2937;"><p>${text || ''}</p></div>`,
    replyTo: replyTo || undefined,
  });

  return true;
};

export const getEmailStatus = () => {
  const config = getEmailConfig();

  return {
    configured: Boolean(config),
    provider: config?.provider || null,
    from: config?.from || null,
  };
};

export const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify/${verificationToken}`;

    await sendMessage({
      to: email,
      subject: 'Verify Your Meritlives Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004aad;">Welcome to Meritlives Tools, ${name || 'there'}!</h2>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a
              href="${verificationUrl}"
              style="background: #004aad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
            >
              Verify Email Address
            </a>
          </div>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    await sendMessage({
      to: email,
      subject: 'Welcome to Meritlives Tools',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004aad;">Welcome to Meritlives Tools, ${name || 'there'}!</h2>
          <p>We&apos;re excited to have you on board.</p>
          <p>Start creating amazing content at ${process.env.FRONTEND_URL || 'http://localhost:3000'}.</p>
        </div>
      `
    });

    return true;
  } catch (error) {
    console.error('Welcome email error:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetUrl, name) => {
  try {
    await sendMessage({
      to: email,
      subject: 'Reset your Meritlives password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #004aad;">Password reset request</h2>
          <p>Hello ${name || 'there'},</p>
          <p>We received a request to reset your password for your Meritlives account.</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a
              href="${resetUrl}"
              style="background: #004aad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;"
            >
              Reset Password
            </a>
          </div>
          <p>This link expires in 30 minutes.</p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Password reset email error:', error);
    return {
      success: false,
      error: error?.message || 'Unknown email error'
    };
  }
};
