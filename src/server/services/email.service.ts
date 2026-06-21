/**
 * Email Service — Template-based email sending
 * Uses nodemailer (already installed)
 */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SKIPPED] To: ${payload.to} | Subject: ${payload.subject}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"INCroute" <${process.env.SMTP_USER}>`,
      ...payload,
    });
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    return false;
  }
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────

export const templates = {
  welcome: (name: string) => ({
    subject: "Welcome to INCroute — Your Business Infrastructure Platform",
    text: `Hi ${name}, Welcome to INCroute. Your account is ready.`,
    html: `<h2>Welcome to INCroute, ${name}!</h2><p>Your business infrastructure platform is ready. Log in to manage your entities, compliance, and more.</p>`,
  }),

  passwordReset: (name: string, link: string) => ({
    subject: "Reset Your INCroute Password",
    text: `Hi ${name}, Reset your password here: ${link}`,
    html: `<h2>Password Reset</h2><p>Hi ${name},</p><p>Click below to reset your password:</p><p><a href="${link}">Reset Password</a></p><p>This link expires in 1 hour.</p>`,
  }),

  complianceReminder: (name: string, task: string, dueDate: string, entity: string) => ({
    subject: `Compliance Due: ${task}`,
    text: `Hi ${name}, ${task} for ${entity} is due on ${dueDate}.`,
    html: `<h2>Compliance Reminder</h2><p>Hi ${name},</p><p><strong>${task}</strong> for <strong>${entity}</strong> is due on <strong>${dueDate}</strong>.</p><p>Please ensure timely filing to avoid penalties.</p>`,
  }),

  invoiceReminder: (name: string, invoiceNo: string, amount: string, dueDate: string) => ({
    subject: `Invoice ${invoiceNo} — Payment Reminder`,
    text: `Hi ${name}, Invoice ${invoiceNo} (${amount}) is due on ${dueDate}.`,
    html: `<h2>Payment Reminder</h2><p>Hi ${name},</p><p>Invoice <strong>${invoiceNo}</strong> for <strong>${amount}</strong> is due on <strong>${dueDate}</strong>.</p>`,
  }),

  ticketUpdate: (name: string, ticketId: string, status: string) => ({
    subject: `Ticket ${ticketId} — Status Update`,
    text: `Hi ${name}, Your ticket ${ticketId} has been updated to: ${status}`,
    html: `<h2>Ticket Update</h2><p>Hi ${name},</p><p>Your ticket <strong>${ticketId}</strong> has been updated to: <strong>${status}</strong>.</p>`,
  }),

  consultationScheduled: (name: string, topic: string, date: string, advisor: string) => ({
    subject: `Consultation Scheduled: ${topic}`,
    text: `Hi ${name}, Your consultation "${topic}" with ${advisor} is scheduled for ${date}.`,
    html: `<h2>Consultation Confirmed</h2><p>Hi ${name},</p><p>Your session <strong>${topic}</strong> with <strong>${advisor}</strong> is confirmed for <strong>${date}</strong>.</p>`,
  }),
};
