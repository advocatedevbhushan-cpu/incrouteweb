/**
 * Notification Engine — Centralized notification service
 * Supports: In-App, Email (future: WhatsApp, SMS)
 */
import prisma from "../db/prisma";
import { sendEmail } from "./email.service";

export type NotificationType =
  | "compliance_due" | "document_uploaded" | "invoice_generated"
  | "ticket_assigned" | "trademark_updated" | "meeting_scheduled"
  | "task_assigned" | "payment_received" | "system";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  // In-app notification (stored in Activity model as system notification)
  await prisma.activity.create({
    data: {
      userId: input.userId,
      type: `notification:${input.type}`,
      title: input.title,
      details: JSON.stringify({ message: input.message, link: input.link }),
    },
  });

  // Email notification (if requested)
  if (input.sendEmail) {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, firstName: true } });
    if (user) {
      await sendEmail({
        to: user.email,
        subject: input.title,
        text: input.message,
        html: `<p>Hi ${user.firstName},</p><p>${input.message}</p>${input.link ? `<p><a href="${input.link}">View Details</a></p>` : ""}`,
      });
    }
  }
}

// ─── BULK COMPLIANCE REMINDERS ───────────────────────────────────
export async function sendComplianceReminders(daysBefore = 7): Promise<number> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBefore);

  const upcoming = await prisma.complianceTask.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lte: targetDate, gte: new Date() },
    },
    include: { entity: { include: { client: true } } },
  });

  let sent = 0;
  for (const task of upcoming) {
    if (task.assigneeId) {
      await createNotification({
        userId: task.assigneeId,
        type: "compliance_due",
        title: `Compliance Due: ${task.title}`,
        message: `${task.title} for ${task.entity.name} is due on ${task.dueDate.toLocaleDateString()}`,
        sendEmail: true,
      });
      sent++;
    }
  }
  return sent;
}

// ─── GET USER NOTIFICATIONS ──────────────────────────────────────
export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.activity.findMany({
    where: { userId, type: { startsWith: "notification:" } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
