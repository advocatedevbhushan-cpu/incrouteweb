/**
 * Client Onboarding Engine
 * Handles multi-step onboarding, document collection, and service delivery tracking.
 */
import prisma from "../db/prisma";
import { createNotification } from "./notification.service";
import { sendWhatsApp } from "./whatsapp.service";

// ─── SERVICE STEP TEMPLATES ──────────────────────────────────────
const SERVICE_STEPS: Record<string, string[]> = {
  PVT_LTD_INCORPORATION: ["Name Approval (RUN)", "DSC Collection", "DIN Processing", "SPICe+ Form Filing", "MOA/AOA Drafting", "Certificate Upload", "PAN & TAN Allotment", "Bank Account Guidance", "Completion"],
  LLP_INCORPORATION: ["Name Reservation (RUN-LLP)", "DSC Collection", "DPIN Processing", "FiLLiP Filing", "LLP Agreement Drafting", "Certificate Upload", "PAN & TAN Allotment", "Completion"],
  OPC_INCORPORATION: ["Name Approval (RUN)", "DSC Collection", "DIN Processing", "Nominee Consent", "SPICe+ Filing", "Certificate Upload", "Completion"],
  GST_REGISTRATION: ["Document Verification", "GST Application Drafting", "ARN Generation", "Officer Query Response", "GSTIN Issued", "Completion"],
  TRADEMARK_FILING: ["Trademark Search", "Class Selection", "Application Drafting", "Filing & TM-A", "Vienna Code Allotment", "Examination", "Completion"],
  COMPLIANCE_ANNUAL: ["Data Collection", "Financial Reconciliation", "Form Drafting", "Director Approval", "Filing", "Acknowledgement", "Completion"],
  TAX_RETURN: ["Document Collection", "Computation", "Tax Calculation", "Client Review", "Filing", "Acknowledgement", "Completion"],
  LEGAL_DRAFTING: ["Requirement Gathering", "First Draft", "Client Review", "Revision", "Final Approval", "Execution Copy", "Completion"],
};

// ─── CREATE SERVICE REQUEST ──────────────────────────────────────
export async function createServiceRequest(data: {
  userId: string;
  clientId?: string;
  serviceType: string;
  companyName?: string;
}) {
  const request = await prisma.serviceRequest.create({
    data: {
      userId: data.userId,
      clientId: data.clientId,
      serviceType: data.serviceType as any,
      companyName: data.companyName,
      status: "DRAFT",
      currentStep: "service",
      progress: 12,
    },
  });

  // Create timeline entry
  await prisma.timelineEntry.create({
    data: {
      serviceRequestId: request.id,
      clientId: data.clientId,
      userId: data.userId,
      type: "application_created",
      title: "Service request created",
      description: `${data.serviceType.replace(/_/g, " ")} application initiated`,
    },
  });

  return request;
}

// ─── UPDATE ONBOARDING STEP ──────────────────────────────────────
export async function updateOnboardingStep(requestId: string, step: string, data: any) {
  const progressMap: Record<string, number> = {
    account: 12, service: 25, company: 37, promoters: 50, documents: 62, review: 75, submitted: 87, tracking: 100,
  };

  const updateData: any = { currentStep: step, progress: progressMap[step] || 50 };
  if (step === "company") updateData.companyInfo = data;
  if (step === "promoters") updateData.promoterInfo = data;
  if (step === "submitted") { updateData.status = "PENDING_DOCUMENTS"; updateData.submittedAt = new Date(); }

  return prisma.serviceRequest.update({ where: { id: requestId }, data: updateData });
}

// ─── SUBMIT FOR PROCESSING ───────────────────────────────────────
export async function submitServiceRequest(requestId: string) {
  const request = await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: "IN_PROGRESS", progress: 87 },
  });

  // Auto-create service steps
  const steps = SERVICE_STEPS[request.serviceType] || SERVICE_STEPS.PVT_LTD_INCORPORATION;
  await prisma.serviceStep.createMany({
    data: steps.map((title, i) => ({
      serviceRequestId: requestId,
      title,
      order: i + 1,
      status: i === 0 ? "IN_PROGRESS" : "PENDING",
    })),
  });

  // Auto-assign relationship manager (round-robin from available admins)
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "TEAM_MEMBER"] }, isActive: true }, take: 1 });
  if (admins.length > 0) {
    await prisma.serviceRequest.update({ where: { id: requestId }, data: { assignedMgrId: admins[0].id } });
  }

  // Timeline
  await prisma.timelineEntry.create({
    data: {
      serviceRequestId: requestId,
      clientId: request.clientId,
      type: "application_submitted",
      title: "Application submitted for processing",
      description: "Your documents are under review. Our team will begin processing shortly.",
    },
  });

  // Notify user
  if (request.userId) {
    await createNotification({
      userId: request.userId,
      type: "task_assigned",
      title: "Application Submitted",
      message: "Your application has been submitted. We'll begin processing within 24 hours.",
      sendEmail: true,
    });
  }

  return request;
}

// ─── ADVANCE SERVICE STEP ────────────────────────────────────────
export async function advanceServiceStep(requestId: string, stepId: string) {
  // Complete current step
  await prisma.serviceStep.update({ where: { id: stepId }, data: { status: "COMPLETED", completedAt: new Date() } });

  // Find and start next step
  const steps = await prisma.serviceStep.findMany({ where: { serviceRequestId: requestId }, orderBy: { order: "asc" } });
  const currentIdx = steps.findIndex(s => s.id === stepId);
  const nextStep = steps[currentIdx + 1];

  if (nextStep) {
    await prisma.serviceStep.update({ where: { id: nextStep.id }, data: { status: "IN_PROGRESS" } });
    // Update progress
    const completed = steps.filter(s => s.status === "COMPLETED").length + 1;
    const progress = Math.round((completed / steps.length) * 100);
    await prisma.serviceRequest.update({ where: { id: requestId }, data: { progress } });
  } else {
    // All steps done
    await prisma.serviceRequest.update({ where: { id: requestId }, data: { status: "COMPLETED", progress: 100, completedAt: new Date() } });
    // Timeline
    await prisma.timelineEntry.create({
      data: { serviceRequestId: requestId, type: "service_completed", title: "Service completed", description: "All steps have been successfully completed." },
    });
  }
}

// ─── DOCUMENT COLLECTION ─────────────────────────────────────────
export async function getRequiredDocuments(serviceType: string): Promise<{ type: string; label: string; required: boolean }[]> {
  const docMap: Record<string, { type: string; label: string; required: boolean }[]> = {
    PVT_LTD_INCORPORATION: [
      { type: "PAN_CARD", label: "PAN Card of all Directors", required: true },
      { type: "AADHAAR", label: "Aadhaar Card of all Directors", required: true },
      { type: "ADDRESS_PROOF", label: "Address Proof (Utility Bill)", required: true },
      { type: "PHOTOGRAPH", label: "Passport-size Photograph", required: true },
      { type: "BANK_STATEMENT", label: "Bank Statement (last 3 months)", required: false },
      { type: "NOC", label: "NOC from Property Owner", required: true },
      { type: "UTILITY_BILL", label: "Electricity Bill of Office", required: true },
    ],
    LLP_INCORPORATION: [
      { type: "PAN_CARD", label: "PAN Card of all Partners", required: true },
      { type: "AADHAAR", label: "Aadhaar Card of all Partners", required: true },
      { type: "ADDRESS_PROOF", label: "Address Proof", required: true },
      { type: "PHOTOGRAPH", label: "Passport-size Photograph", required: true },
      { type: "NOC", label: "NOC from Property Owner", required: true },
      { type: "PARTNERSHIP_DEED", label: "Partnership Deed (Draft)", required: false },
    ],
    GST_REGISTRATION: [
      { type: "PAN_CARD", label: "PAN Card", required: true },
      { type: "AADHAAR", label: "Aadhaar Card", required: true },
      { type: "BANK_STATEMENT", label: "Cancelled Cheque / Bank Statement", required: true },
      { type: "UTILITY_BILL", label: "Electricity Bill of Premises", required: true },
      { type: "NOC", label: "NOC from Landlord", required: true },
    ],
    TRADEMARK_FILING: [
      { type: "TRADEMARK_LOGO", label: "Logo/Wordmark (JPEG/PNG)", required: true },
      { type: "PAN_CARD", label: "PAN Card of Applicant", required: true },
      { type: "ADDRESS_PROOF", label: "Address Proof", required: true },
    ],
  };
  return docMap[serviceType] || docMap.PVT_LTD_INCORPORATION;
}

// ─── DOCUMENT VERIFICATION ───────────────────────────────────────
export async function verifyDocument(docId: string, action: "approve" | "reject", reviewerId: string, reason?: string) {
  const status = action === "approve" ? "APPROVED" : "REJECTED";
  await prisma.serviceDocument.update({
    where: { id: docId },
    data: { status, reviewedBy: reviewerId, reviewedAt: new Date(), rejectReason: reason },
  });

  const doc = await prisma.serviceDocument.findUnique({ where: { id: docId }, include: { serviceRequest: true } });
  if (doc?.serviceRequest?.userId) {
    const msg = action === "approve" ? `Your ${doc.label} has been approved.` : `Your ${doc.label} was rejected: ${reason}`;
    await createNotification({ userId: doc.serviceRequest.userId, type: "document_uploaded", title: `Document ${action === "approve" ? "Approved" : "Rejected"}`, message: msg, sendEmail: true });

    // WhatsApp
    if (action === "approve") {
      await sendWhatsApp({ phone: "", templateId: "document_approved", variables: { documentName: doc.label } });
    } else {
      await sendWhatsApp({ phone: "", templateId: "document_rejected", variables: { documentName: doc.label, reason: reason || "Does not meet requirements" } });
    }
  }

  // Timeline
  await prisma.timelineEntry.create({
    data: {
      serviceRequestId: doc?.serviceRequestId,
      type: action === "approve" ? "document_approved" : "document_rejected",
      title: `Document ${action}d: ${doc?.label}`,
      description: reason,
    },
  });
}
