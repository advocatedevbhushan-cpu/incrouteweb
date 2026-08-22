import jsPDF from "jspdf";

export interface ProposalData {
  proposalNo?: string;
  clientName: string;
  companyName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceTitle: string;
  scopeSummary?: string;
  timeline?: string;
  deliverables?: string[];
  items?: {
    description: string;
    hsn?: string;
    govtFee: number;
    professionalFee: number;
  }[];
  notes?: string;
  preparedBy?: string;
}

export function generateProposalPDF(data: ProposalData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 18;
  const cw = pw - m * 2;
  let y = 0;

  const propNo = data.proposalNo || `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // ─── 1. Header Banner (Dark Navy & Gold) ───
  doc.setFillColor(13, 14, 21);
  doc.rect(0, 0, pw, 38, "F");

  // Gold accent bar
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 38, pw, 1.5, "F");

  // Logo & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("INC", m, 16);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(212, 175, 55);
  doc.text("route", m + 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 185, 200);
  doc.text("CORPORATE REGISTRATIONS & STATUTORY ADVISORY", m, 22);
  doc.text("Web: incroute.com  |  Email: info@incroute.com  |  Helpline: +91 87075 52183", m, 26);

  // Proposal Title on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(212, 175, 55);
  doc.text("FORMAL PROPOSAL & QUOTATION", pw - m, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(220, 225, 240);
  doc.text(`Ref: ${propNo}`, pw - m, 22, { align: "right" });
  doc.text(`Date: ${issueDate}`, pw - m, 26, { align: "right" });
  doc.text(`Valid Till: ${validUntil}`, pw - m, 30, { align: "right" });

  y = 48;

  // ─── 2. Client Info Card ───
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(m, y, cw, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("PREPARED SPECIFICALLY FOR", m + 5, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.clientName || "Valued Client", m + 5, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const companyInfo = data.companyName ? `Entity / Proposed Name: ${data.companyName}` : "Proposed Entity / Business Engagement";
  doc.text(companyInfo, m + 5, y + 17);
  if (data.clientPhone || data.clientEmail) {
    const contactLine = [data.clientPhone ? `Phone: ${data.clientPhone}` : "", data.clientEmail ? `Email: ${data.clientEmail}` : ""].filter(Boolean).join("  |  ");
    doc.text(contactLine, m + 5, y + 21);
  }

  // Right Badge in Client Card
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(pw - m - 45, y + 4, 40, 16, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text("SERVICE PROPOSAL", pw - m - 25, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(data.timeline || "5–7 Working Days", pw - m - 25, y + 15, { align: "center" });

  y += 31;

  // ─── 3. Executive Scope ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Engagement Scope: ${data.serviceTitle}`, m, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const summaryText = data.scopeSummary || 
    `INCroute will provide end-to-end statutory execution for ${data.serviceTitle}. Our certified Chartered Accountants and Company Secretaries handle complete documentation, secretarial drafting, government portal verification, and certificate allocation with zero query rejections.`;
  
  const splitSummary = doc.splitTextToSize(summaryText, cw);
  doc.text(splitSummary, m, y);
  y += splitSummary.length * 4 + 4;

  // ─── 4. Deliverables Bullet Grid ───
  const deliverables = data.deliverables || [
    "Digital Signature Certificate (DSC) & Director Identification Numbers (DIN)",
    "Name Reservation & Approval through Central Registration Centre (CRC / RUN)",
    "Drafting of customized Memorandum (MOA) & Articles of Association (AOA)",
    "Government SPICe+ e-filing with Certificate of Incorporation issuance",
    "Company PAN, TAN, EPFO, ESIC & Professional Tax registrations",
    "Post-incorporation commencement kit, bank account opening kit & statutory advisory"
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Key Deliverables Included:", m, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  
  for (let i = 0; i < deliverables.length; i++) {
    doc.setFillColor(79, 70, 229);
    doc.circle(m + 2, y - 1, 0.8, "F");
    doc.text(deliverables[i], m + 5, y);
    y += 4;
  }
  y += 4;

  // ─── 5. Itemized Financial Schedule Table ───
  const items = data.items || [
    {
      description: `${data.serviceTitle} — Professional Legal & Secretarial Fee`,
      hsn: "998313",
      govtFee: 0,
      professionalFee: 5999
    },
    {
      description: "Government Filing Fee, Stamp Duty & Name Approval Outlay",
      hsn: "998313",
      govtFee: 1500,
      professionalFee: 0
    }
  ];

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(m, y, cw, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("S.No", m + 3, y + 4.5);
  doc.text("Description & Statutory Deliverable", m + 14, y + 4.5);
  doc.text("SAC Code", m + 105, y + 4.5);
  doc.text("Govt Outlay", m + 130, y + 4.5);
  doc.text("Prof. Fee (INR)", pw - m - 3, y + 4.5, { align: "right" });
  y += 7;

  let totalGovt = 0;
  let totalProf = 0;

  items.forEach((it, idx) => {
    totalGovt += it.govtFee || 0;
    totalProf += it.professionalFee || 0;

    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(m, y, cw, 6.5, "F");
    doc.setDrawColor(241, 245, 249);
    doc.line(m, y + 6.5, pw - m, y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(String(idx + 1), m + 3, y + 4.5);
    doc.text(it.description, m + 14, y + 4.5);
    doc.text(it.hsn || "998313", m + 105, y + 4.5);
    doc.text(it.govtFee ? `Rs ${it.govtFee.toLocaleString("en-IN")}` : "Included/At Actuals", m + 130, y + 4.5);
    doc.text(`Rs ${it.professionalFee.toLocaleString("en-IN")}`, pw - m - 3, y + 4.5, { align: "right" });
    y += 6.5;
  });

  // Totals Breakdown
  const gstAmount = Math.round(totalProf * 0.18);
  const netPayable = totalProf + gstAmount + totalGovt;

  y += 2;
  const totalsX = pw - m - 65;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(totalsX, y, 65, 24, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Professional Fee:", totalsX + 3, y + 5);
  doc.text(`Rs ${totalProf.toLocaleString("en-IN")}`, pw - m - 3, y + 5, { align: "right" });

  doc.text("GST (18% on Prof Fee):", totalsX + 3, y + 10);
  doc.text(`Rs ${gstAmount.toLocaleString("en-IN")}`, pw - m - 3, y + 10, { align: "right" });

  doc.text("Govt Fee Outlay:", totalsX + 3, y + 15);
  doc.text(`Rs ${totalGovt.toLocaleString("en-IN")}`, pw - m - 3, y + 15, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 3, y + 17.5, pw - m - 3, y + 17.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Total All-Inclusive:", totalsX + 3, y + 21.5);
  doc.setTextColor(79, 70, 229);
  doc.text(`Rs ${netPayable.toLocaleString("en-IN")}`, pw - m - 3, y + 21.5, { align: "right" });

  // ─── 6. Bank & Payment Info ───
  const bankY = y;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(m, bankY, cw - 70, 24, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Direct Bank / UPI Settlement Details", m + 4, bankY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Account Name: INCROUTE ADVISORY PRIVATE LIMITED", m + 4, bankY + 10);
  doc.text("Bank Name: ICICI Bank  |  A/C Type: Current Account", m + 4, bankY + 14);
  doc.text("Account No: 000205001234  |  IFSC: ICIC0000002", m + 4, bankY + 18);
  doc.text("UPI ID: incroute@icici  |  Payment Milestone: 50% Advance / 50% on Draft Signoff", m + 4, bankY + 22);

  y += 28;

  // ─── 7. Terms & Standard Conditions ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TERMS OF ENGAGEMENT & STATUTORY CONDITIONS", m, y);
  y += 3.5;

  const defaultTerms = data.notes || 
    "1. Government statutory outlays and stamp duties are calculated based on standard authorized capital (Rs 1,00,000 / 2 Directors).\n" +
    "2. Scope includes dedicated end-to-end secretarial filing until formal certificate allocation by CRC / MCA / Department.\n" +
    "3. Client is required to provide accurate KYC proofs (PAN, Aadhaar, Bank Statement, Utility Bill) within 3 working days.\n" +
    "4. All communications are confidential and protected by standard corporate legal advisory privilege.\n" +
    "5. Proposal valid for 30 calendar days from the date of issuance.";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const splitTerms = doc.splitTextToSize(defaultTerms, cw);
  doc.text(splitTerms, m, y);
  y += splitTerms.length * 3 + 4;

  // ─── 8. Signature & Authorization ───
  const signY = ph - 25;
  doc.setDrawColor(226, 232, 240);
  doc.line(m, signY - 2, pw - m, signY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized by:", m, signY + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(data.preparedBy || "Corporate Advisory Practice Lead, INCroute", m, signY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Accepted by Client:", pw - m - 45, signY + 3);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Sign / Digital Acceptance", pw - m - 45, signY + 7);

  // ─── 9. Footer Bar ───
  doc.setFillColor(13, 14, 21);
  doc.rect(0, ph - 9, pw, 9, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 185, 200);
  doc.text("INCroute Corporate Services — Digital Legal & Compliance Infrastructure for Indian Enterprises", pw / 2, ph - 3.5, { align: "center" });

  return doc;
}
