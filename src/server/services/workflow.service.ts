/**
 * Workflow Automation Engine
 * Handles: Client onboarding, task creation, document workflows, escalations
 */
import prisma from "../db/prisma";
import { generateComplianceTasks, updateEntityComplianceScore } from "./compliance.service";
import { createNotification } from "./notification.service";

// ─── CLIENT ONBOARDING WORKFLOW ──────────────────────────────────
export async function onboardClient(clientId: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { entities: true },
  });
  if (!client) return;

  // Auto-generate compliance tasks for each entity
  for (const entity of client.entities) {
    if (entity.incorporatedAt) {
      await generateComplianceTasks(entity.id, entity.type, entity.incorporatedAt);
      await updateEntityComplianceScore(entity.id);
    }
  }

  // Create welcome task for relationship manager
  if (client.relationshipMgrId) {
    await prisma.task.create({
      data: {
        clientId,
        title: `Welcome call — ${client.companyName}`,
        description: "Schedule introductory call with new client. Review compliance requirements and set expectations.",
        assigneeId: client.relationshipMgrId,
        priority: "HIGH",
        status: "PENDING",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
    });
  }

  // Log activity
  await prisma.activity.create({
    data: { clientId, type: "onboarding", title: `Client onboarded: ${client.companyName}` },
  });
}

// ─── DOCUMENT APPROVAL WORKFLOW ──────────────────────────────────
export async function submitDocumentForReview(documentId: string, submitterId: string): Promise<void> {
  await prisma.document.update({ where: { id: documentId }, data: { status: "UNDER_REVIEW" } });
  // Notify admin/reviewer
  const doc = await prisma.document.findUnique({ where: { id: documentId }, include: { client: true } });
  if (doc) {
    await prisma.activity.create({
      data: { clientId: doc.clientId, userId: submitterId, type: "document_submitted", title: `Document submitted for review: ${doc.title}` },
    });
  }
}

export async function approveDocument(documentId: string, approverId: string): Promise<void> {
  await prisma.document.update({ where: { id: documentId }, data: { status: "APPROVED", approvedBy: approverId, approvedAt: new Date() } });
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (doc?.uploadedBy) {
    await createNotification({ userId: doc.uploadedBy, type: "document_uploaded", title: "Document Approved", message: `Your document "${doc.title}" has been approved.` });
  }
}

export async function rejectDocument(documentId: string, reason: string): Promise<void> {
  await prisma.document.update({ where: { id: documentId }, data: { status: "REJECTED" } });
}

// ─── TASK AUTO-ASSIGNMENT ────────────────────────────────────────
export async function autoAssignTask(taskId: string): Promise<string | null> {
  // Find team member with lowest workload
  const members = await prisma.user.findMany({
    where: { role: { in: ["TEAM_MEMBER", "ADMIN"] }, isActive: true },
    include: { _count: { select: { assignments: true } } },
  });
  if (members.length === 0) return null;

  const leastLoaded = members.sort((a, b) => a._count.assignments - b._count.assignments)[0];
  await prisma.task.update({ where: { id: taskId }, data: { assigneeId: leastLoaded.id } });

  await createNotification({
    userId: leastLoaded.id,
    type: "task_assigned",
    title: "New Task Assigned",
    message: "A new task has been automatically assigned to you.",
  });

  return leastLoaded.id;
}

// ─── INVOICE OVERDUE AUTOMATION ──────────────────────────────────
export async function markOverdueInvoices(): Promise<number> {
  const result = await prisma.invoice.updateMany({
    where: { status: "SENT", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });
  return result.count;
}

// ─── SUPPORT ESCALATION ──────────────────────────────────────────
export async function escalateOldTickets(hoursOld = 48): Promise<number> {
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  const result = await prisma.ticket.updateMany({
    where: { status: "OPEN", createdAt: { lt: cutoff } },
    data: { status: "ESCALATED" },
  });
  return result.count;
}

// ─── DOCUMENT EXPIRY ENGINE ──────────────────────────────────────
export async function checkDocumentExpiry(daysBefore = 30): Promise<number> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBefore);

  const expiring = await prisma.document.findMany({
    where: { expiresAt: { lte: targetDate, gte: new Date() }, status: { not: "EXPIRED" } },
    include: { client: true },
  });

  for (const doc of expiring) {
    if (doc.uploadedBy) {
      await createNotification({
        userId: doc.uploadedBy,
        type: "document_uploaded",
        title: `Document Expiring: ${doc.title}`,
        message: `${doc.title} expires on ${doc.expiresAt?.toLocaleDateString()}. Please renew.`,
        sendEmail: true,
      });
    }
  }
  return expiring.length;
}
