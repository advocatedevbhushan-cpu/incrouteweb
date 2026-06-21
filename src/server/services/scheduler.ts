/**
 * Automation Scheduler — Runs periodic tasks
 * Call startScheduler() from server.ts after DB connection.
 */
import { markOverdueTasks } from "./compliance.service";
import { sendComplianceReminders } from "./notification.service";
import { markOverdueInvoices, escalateOldTickets, checkDocumentExpiry } from "./workflow.service";

let intervalId: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (intervalId) return; // Already running

  console.log("⏱️  Automation scheduler started");

  // Run every hour
  intervalId = setInterval(async () => {
    try {
      const overdueTasks = await markOverdueTasks();
      const overdueInvoices = await markOverdueInvoices();
      const escalated = await escalateOldTickets(48);
      const expiringDocs = await checkDocumentExpiry(30);

      if (overdueTasks || overdueInvoices || escalated || expiringDocs) {
        console.log(`[SCHEDULER] Overdue tasks: ${overdueTasks}, Overdue invoices: ${overdueInvoices}, Escalated tickets: ${escalated}, Expiring docs: ${expiringDocs}`);
      }
    } catch (err) {
      console.error("[SCHEDULER ERROR]", err);
    }
  }, 60 * 60 * 1000); // Every hour

  // Run compliance reminders daily at startup and then every 24h
  runComplianceReminders();
  setInterval(runComplianceReminders, 24 * 60 * 60 * 1000);
}

async function runComplianceReminders() {
  try {
    const sent7 = await sendComplianceReminders(7);
    const sent3 = await sendComplianceReminders(3);
    const sent1 = await sendComplianceReminders(1);
    console.log(`[REMINDERS] 7-day: ${sent7}, 3-day: ${sent3}, 1-day: ${sent1}`);
  } catch (err) {
    console.error("[REMINDER ERROR]", err);
  }
}

export function stopScheduler() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}
