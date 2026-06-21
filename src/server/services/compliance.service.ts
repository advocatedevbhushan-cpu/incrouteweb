/**
 * Compliance Service — Core operational engine
 * Handles task creation, health score calculation, and automation.
 */
import prisma from "../db/prisma";

// ─── COMPLIANCE HEALTH SCORE ─────────────────────────────────────
export async function calculateComplianceHealth(entityId: string): Promise<number> {
  const [total, completed] = await Promise.all([
    prisma.complianceTask.count({ where: { entityId } }),
    prisma.complianceTask.count({ where: { entityId, status: "COMPLETED" } }),
  ]);
  if (total === 0) return 100;
  return Math.round((completed / total) * 100);
}

export async function updateEntityComplianceScore(entityId: string): Promise<void> {
  const score = await calculateComplianceHealth(entityId);
  await prisma.entity.update({ where: { id: entityId }, data: { complianceScore: score } });
}

// ─── OVERDUE DETECTION ───────────────────────────────────────────
export async function markOverdueTasks(): Promise<number> {
  const now = new Date();
  const result = await prisma.complianceTask.updateMany({
    where: { dueDate: { lt: now }, status: { in: ["PENDING", "IN_PROGRESS"] } },
    data: { status: "OVERDUE" },
  });
  return result.count;
}

// ─── AUTO-CREATE COMPLIANCE TASKS FOR ENTITY ─────────────────────
interface ComplianceTemplate {
  title: string;
  category: "ROC" | "GST" | "DIN_KYC" | "INCOME_TAX" | "BOARD_MEETING" | "ANNUAL_FILING" | "TDS" | "OTHER";
  monthsFromIncorporation: number;
  recurring: boolean;
  recurringMonths?: number;
}

const PVT_LTD_TEMPLATES: ComplianceTemplate[] = [
  { title: "Form 20A (Commencement of Business)", category: "ROC", monthsFromIncorporation: 6, recurring: false },
  { title: "First Board Meeting", category: "BOARD_MEETING", monthsFromIncorporation: 1, recurring: false },
  { title: "DIR-3 KYC", category: "DIN_KYC", monthsFromIncorporation: 3, recurring: true, recurringMonths: 12 },
  { title: "AOC-4 (Financial Statements)", category: "ANNUAL_FILING", monthsFromIncorporation: 12, recurring: true, recurringMonths: 12 },
  { title: "MGT-7 (Annual Return)", category: "ANNUAL_FILING", monthsFromIncorporation: 12, recurring: true, recurringMonths: 12 },
  { title: "Board Meeting", category: "BOARD_MEETING", monthsFromIncorporation: 3, recurring: true, recurringMonths: 3 },
  { title: "GSTR-1", category: "GST", monthsFromIncorporation: 1, recurring: true, recurringMonths: 1 },
  { title: "GSTR-3B", category: "GST", monthsFromIncorporation: 1, recurring: true, recurringMonths: 1 },
  { title: "Income Tax Return", category: "INCOME_TAX", monthsFromIncorporation: 9, recurring: true, recurringMonths: 12 },
];

export async function generateComplianceTasks(entityId: string, entityType: string, incorporatedAt: Date): Promise<number> {
  let templates: ComplianceTemplate[] = [];
  if (entityType === "PVT_LTD" || entityType === "OPC" || entityType === "PUBLIC_LTD") templates = PVT_LTD_TEMPLATES;
  else if (entityType === "LLP") templates = PVT_LTD_TEMPLATES.filter(t => !["ROC"].includes(t.category) || t.title.includes("Annual"));
  else templates = PVT_LTD_TEMPLATES.filter(t => t.category === "GST" || t.category === "INCOME_TAX");

  const tasks = templates.map(t => {
    const dueDate = new Date(incorporatedAt);
    dueDate.setMonth(dueDate.getMonth() + t.monthsFromIncorporation);
    return { entityId, title: t.title, category: t.category as any, dueDate, priority: "MEDIUM" as any, status: "PENDING" as any };
  });

  const result = await prisma.complianceTask.createMany({ data: tasks, skipDuplicates: true });
  return result.count;
}

// ─── COMPLIANCE QUERIES ──────────────────────────────────────────
export async function getUpcomingCompliance(entityId?: string, limit = 10) {
  const where: any = { status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { gte: new Date() } };
  if (entityId) where.entityId = entityId;
  return prisma.complianceTask.findMany({ where, orderBy: { dueDate: "asc" }, take: limit, include: { entity: { select: { name: true, clientId: true } } } });
}

export async function getOverdueCompliance(limit = 20) {
  return prisma.complianceTask.findMany({ where: { status: "OVERDUE" }, orderBy: { dueDate: "asc" }, take: limit, include: { entity: { select: { name: true, clientId: true } } } });
}
