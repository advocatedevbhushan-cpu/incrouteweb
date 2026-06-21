/**
 * WhatsApp Notification Architecture — Provider Abstraction Layer
 * Supports: WhatsApp Business API, Twilio, Interakt, WATI, AISensy
 * 
 * IMPORTANT: No live API keys required. Messages are queued and logged.
 * Connect provider when ready by implementing the send() method.
 */
import prisma from "../db/prisma";

// ─── PROVIDER INTERFACE ──────────────────────────────────────────
interface WhatsAppProvider {
  name: string;
  send(phone: string, templateId: string, variables: Record<string, string>): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// ─── PROVIDER IMPLEMENTATIONS (stubs — plug in real API when ready) ──
const providers: Record<string, WhatsAppProvider> = {
  whatsapp_business: {
    name: "WhatsApp Business API",
    async send(phone, templateId, variables) {
      // Future: Meta Cloud API call
      console.log(`[WA:Business] → ${phone} | Template: ${templateId} | Vars:`, variables);
      return { success: true, messageId: `wa_${Date.now()}` };
    },
  },
  twilio: {
    name: "Twilio",
    async send(phone, templateId, variables) {
      // Future: Twilio WhatsApp API call
      console.log(`[WA:Twilio] → ${phone} | Template: ${templateId}`);
      return { success: true, messageId: `twilio_${Date.now()}` };
    },
  },
  interakt: {
    name: "Interakt",
    async send(phone, templateId, variables) {
      console.log(`[WA:Interakt] → ${phone} | Template: ${templateId}`);
      return { success: true, messageId: `interakt_${Date.now()}` };
    },
  },
  wati: {
    name: "WATI",
    async send(phone, templateId, variables) {
      console.log(`[WA:WATI] → ${phone} | Template: ${templateId}`);
      return { success: true, messageId: `wati_${Date.now()}` };
    },
  },
};

const ACTIVE_PROVIDER = process.env.WHATSAPP_PROVIDER || "whatsapp_business";
const MAX_RETRIES = 3;

// ─── TEMPLATE LIBRARY ────────────────────────────────────────────
export const WA_TEMPLATES: Record<string, { body: string; variables: string[] }> = {
  welcome: {
    body: "Welcome to INCroute, {{clientName}}! Your account is ready. Track your business at {{portalUrl}}",
    variables: ["clientName", "portalUrl"],
  },
  document_request: {
    body: "Hi {{clientName}}, we need {{documentName}} to proceed with your {{serviceName}}. Upload at {{uploadUrl}}",
    variables: ["clientName", "documentName", "serviceName", "uploadUrl"],
  },
  document_approved: {
    body: "Good news, {{clientName}}! Your {{documentName}} has been approved. ✓",
    variables: ["clientName", "documentName"],
  },
  document_rejected: {
    body: "Hi {{clientName}}, your {{documentName}} needs revision. Reason: {{reason}}. Please re-upload.",
    variables: ["clientName", "documentName", "reason"],
  },
  compliance_reminder: {
    body: "Reminder: {{taskName}} for {{entityName}} is due on {{dueDate}}. Ensure timely filing.",
    variables: ["taskName", "entityName", "dueDate"],
  },
  consultation_reminder: {
    body: "Your consultation '{{topic}}' with {{advisorName}} is scheduled for {{dateTime}}. Meeting link: {{meetingUrl}}",
    variables: ["topic", "advisorName", "dateTime", "meetingUrl"],
  },
  trademark_update: {
    body: "Trademark update: {{trademarkName}} status changed to {{status}}. Next: {{nextAction}}",
    variables: ["trademarkName", "status", "nextAction"],
  },
  service_completion: {
    body: "🎉 {{serviceName}} for {{companyName}} is now complete! View certificate at {{portalUrl}}",
    variables: ["serviceName", "companyName", "portalUrl"],
  },
  invoice_reminder: {
    body: "Invoice {{invoiceNo}} ({{amount}}) is due on {{dueDate}}. Pay now to avoid late fees.",
    variables: ["invoiceNo", "amount", "dueDate"],
  },
};

// ─── SEND MESSAGE ────────────────────────────────────────────────
export async function sendWhatsApp(input: {
  phone: string;
  templateId: string;
  variables: Record<string, string>;
  provider?: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const providerKey = input.provider || ACTIVE_PROVIDER;
  const provider = providers[providerKey];

  if (!provider) {
    console.error(`[WA] Unknown provider: ${providerKey}`);
    return { success: false };
  }

  // Skip if no phone
  if (!input.phone) {
    console.log(`[WA] Skipped — no phone number | Template: ${input.templateId}`);
    return { success: false };
  }

  // Queue message in DB
  const msg = await prisma.whatsAppMessage.create({
    data: {
      recipientPhone: input.phone,
      templateId: input.templateId,
      variables: input.variables,
      provider: providerKey,
      status: "QUEUED",
    },
  });

  // Attempt send
  try {
    const result = await provider.send(input.phone, input.templateId, input.variables);
    if (result.success) {
      await prisma.whatsAppMessage.update({
        where: { id: msg.id },
        data: { status: "SENT", providerMsgId: result.messageId, sentAt: new Date() },
      });
      return { success: true, messageId: result.messageId };
    } else {
      await prisma.whatsAppMessage.update({
        where: { id: msg.id },
        data: { status: "FAILED", failReason: result.error, failedAt: new Date() },
      });
      return { success: false };
    }
  } catch (err: any) {
    await prisma.whatsAppMessage.update({
      where: { id: msg.id },
      data: { status: "FAILED", failReason: err.message, failedAt: new Date() },
    });
    return { success: false };
  }
}

// ─── RETRY FAILED MESSAGES ───────────────────────────────────────
export async function retryFailedMessages(): Promise<number> {
  const failed = await prisma.whatsAppMessage.findMany({
    where: { status: "FAILED", retryCount: { lt: MAX_RETRIES } },
    take: 50,
  });

  let retried = 0;
  for (const msg of failed) {
    await prisma.whatsAppMessage.update({ where: { id: msg.id }, data: { retryCount: msg.retryCount + 1, status: "RETRY" } });
    const result = await sendWhatsApp({
      phone: msg.recipientPhone,
      templateId: msg.templateId,
      variables: (msg.variables as Record<string, string>) || {},
    });
    if (result.success) retried++;
  }
  return retried;
}
