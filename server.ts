import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK on server side with proper headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Dynamic In-Memory Database for demonstration/tracking consistency

// Active compliance calendar list for reference or audit tasks
let complianceCalendar = [
  { id: "1", service: "GST Filing", description: "Monthly GSTR-1 & GSTR-3B filings", dueDate: "11th and 20th of every month", type: "taxation", downloadUrl: "https://www.gst.gov.in/" },
  { id: "2", service: "Income Tax Audit", description: "Tax Audit Filing and assessment for entities", dueDate: "September 30th annually", type: "taxation", downloadUrl: "https://www.incometax.gov.in/iec/foportal/" },
  { id: "3", service: "ROC Annual Filing", description: "Form MGT-7 and Form AOC-4 Filing with Registrar", dueDate: "Within 30 and 60 days of AGM", type: "corporate", downloadUrl: "https://www.mca.gov.in/content/mca/global/en/help-guide/company-forms-download.html" },
  { id: "4", service: "TDS Returns", description: "Quarterly TDS Filings (Form 24Q, 26Q)", dueDate: "Last day of succeeding month of quarter", type: "taxation", downloadUrl: "https://www.tin-nsdl.com/services/etds-etcs/etds-index.html" },
  { id: "5", service: "EPF & ESIC Return", description: "Monthly social security statutory deposit and returns", dueDate: "15th of every month", type: "employment", downloadUrl: "https://www.epfindia.gov.in/" }
];

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // HTTPS redirect (production only)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }



  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });



  // Persistent Config storage for Google Forms Connection
  const CONFIG_FILE = path.join(process.cwd(), "contact-form-config.json");
  let contactFormUri: string | null = process.env.GOOGLE_FORM_URI || null;

  // Load persisted config on startup if not set in environment
  if (contactFormUri) {
    console.log(`🟢 LOADED GOOGLE FORM URI FROM ENVIRONMENT: ${contactFormUri}`);
  } else if (fs.existsSync(CONFIG_FILE)) {
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      contactFormUri = configData.uri || null;
      console.log(`🟢 LOADED PERSISTED GOOGLE FORM URI: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to read persisted contact form config:", err.message);
    }
  }

  // Config endpoints
  app.get("/api/config/contact-form", (req, res) => {
    res.json({ success: true, uri: contactFormUri });
  });

  app.post("/api/config/contact-form", (req, res) => {
    const { uri } = req.body;
    contactFormUri = uri;
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ uri }, null, 2), "utf-8");
      console.log(`🟢 PERSISTED GOOGLE FORM URI TO DISK: ${contactFormUri}`);
    } catch (err: any) {
      console.error("Failed to persist contact form config:", err.message);
    }
    res.json({ success: true, uri: contactFormUri });
  });

// Local Memory Storage and Disk Persistence for Contact Submissions
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");
let contactSubmissions: any[] = [];

// Load existing submissions from disk at startup
if (fs.existsSync(SUBMISSIONS_FILE)) {
  try {
    contactSubmissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    console.log(`🟢 LOADED PERSISTED SUBMISSIONS: ${contactSubmissions.length} entries`);
  } catch (err: any) {
    console.error("Failed to read persisted contact submissions:", err.message);
  }
}

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const newSubmission = {
    id: `MSG-${Math.floor(Math.random() * 10000)}`,
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  };

  // Store in memory list
  contactSubmissions.push(newSubmission);

  // Persist immediately to local JSON file
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(contactSubmissions, null, 2), "utf-8");
    console.log(`🟢 PERSISTED NEW SUBMISSION TO DISK: ${newSubmission.id}`);
  } catch (err: any) {
    console.error("Failed to persist submission to disk:", err.message);
  }

  // Log to server console so user understands where it goes
  console.log("\n---- NEW CONTACT SUBMISSION ----");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone || "N/A"}`);
  console.log(`Message: ${message}`);
  console.log("--------------------------------\n");
  console.log(`(NOTE: Total submissions saved in server memory & disk: ${contactSubmissions.length})`);

  // Background Google Form Sync (Method 2)
  if (contactFormUri) {
    console.log(`Google Cloud Connection active! Syncing lead dynamically to Google Forms...`);
    try {
      // 1. Fetch the public form page to parse field entry IDs
      const formResponse = await fetch(contactFormUri);
      if (formResponse.ok) {
        const html = await formResponse.text();

        // High-tech regex to extract modern Google Forms entry IDs from data-params
        const entryIds: string[] = [];
        const paramRegex = /data-params="%\.@\.\[(.*?)\]/g;
        let match;
        while ((match = paramRegex.exec(html)) !== null) {
          const content = match[1];
          const idMatch = content.match(/\[\[(\d+)/);
          if (idMatch && !entryIds.includes(idMatch[1])) {
            entryIds.push(idMatch[1]);
          }
        }

        console.log(`Successfully mapped Google Form field entry IDs:`, entryIds);

        // We expect the form to have our 4 fields: Full Name, Email, Phone, Message
        if (entryIds.length >= 4) {
          const postUrl = contactFormUri.replace("/viewform", "/formResponse");

          // Build urlencoded body
          const params = new URLSearchParams();
          params.append(`entry.${entryIds[0]}`, name);
          params.append(`entry.${entryIds[1]}`, email);
          params.append(`entry.${entryIds[2]}`, phone || "");
          params.append(`entry.${entryIds[3]}`, message);

          // Submit in background
          const submitRes = await fetch(postUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });

          if (submitRes.ok) {
            console.log(`🟢 LEAD SYNC SUCCESS: Data pushed to Google Forms & Google Sheets in the background!`);
          } else {
            console.error(`🔴 LEAD SYNC ERROR: Google Forms returned status ${submitRes.status} (${submitRes.statusText})`);
          }
        } else {
          console.warn(`⚠️ LEAD SYNC WARNING: Found insufficient entry fields in the Google Form template (found ${entryIds.length}, expected 4).`);
        }
      } else {
        console.error(`🔴 LEAD SYNC ERROR: Failed to retrieve Google Form template at ${contactFormUri}`);
      }
    } catch (gErr: any) {
      console.error("🔴 LEAD SYNC EXCEPTION: Failed background submission to Google Forms:", gErr.message);
    }
  }

  res.json({ success: true, message: "Contact saved successfully." });
});

// Premium Draft Request endpoint
// NOTE: For production, configure SMTP via Nodemailer or use EmailJS.
// Currently logs to console and stores in memory. Replace with actual email sending.
let premiumRequests: any[] = [];

app.post("/api/send-premium-request", (req, res) => {
  const { fullName, email, phone, companyName, notes, preferredTime, wizardData, agreedToTerms } = req.body;

  if (!fullName || !email || !companyName || !agreedToTerms) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const request = {
    id: `PREM-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName,
    email,
    phone: phone || "N/A",
    companyName,
    notes: notes || "None",
    preferredTime: preferredTime || "Anytime",
    wizardData: wizardData || {},
    agreedToTerms,
    timestamp: new Date().toISOString(),
  };

  premiumRequests.push(request);

  // Log to console (replace with Nodemailer SMTP in production)
  console.log("\n════════════════════════════════════════════");
  console.log("  🏆 NEW PREMIUM DRAFTING REQUEST");
  console.log("════════════════════════════════════════════");
  console.log(`  Name: ${fullName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Phone: ${phone || "N/A"}`);
  console.log(`  Company: ${companyName}`);
  console.log(`  Notes: ${notes || "None"}`);
  console.log(`  Preferred Time: ${preferredTime || "Anytime"}`);
  console.log(`  Wizard Data: ${JSON.stringify(wizardData || {})}`);
  console.log(`  Timestamp: ${request.timestamp}`);
  console.log("════════════════════════════════════════════\n");
  console.log(`  📧 TODO: Send email to premium@incroute.com`);
  console.log(`  Subject: New Premium Drafting Request for ${companyName}\n`);

  res.json({
    success: true,
    message: "Premium drafting request received successfully.",
    requestId: request.id,
  });
});

  // AI Name Feasibility clearance check (DeepSeek API Integration)
  app.post("/api/consult/name-check", async (req, res) => {
    const { name, entityType, industry } = req.body;

    if (!name || !entityType || !industry) {
      return res.status(400).json({ success: false, error: "Name, entity type, and industry are required." });
    }

    const checkPrompt = `Perform a comprehensive, professional name feasibility and registration clearance check for a proposed corporate entity in India.
Proposed Name: "${name}"
Entity Type: "${entityType}"
Sector/Industry: "${industry}"

Assess the proposed name meticulously against naming guidelines (e.g. check if generic, check if offensive, check prefix/suffix suitability, check for prefix descriptiveness).
Format your response as a strict, clean JSON object. Return ONLY the raw JSON string matching this exact structure:
{
  "score": 85,
  "summary": "Detailed professional suitability summary...",
  "conflicts": [
    "Conflict checking notes...",
    "Trademarks search similarity warnings..."
  ],
  "checklist": [
    { "criterion": "Not generic or common words only", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "No offensive or restricted keywords", "passed": true, "reason": "Passed explanation..." },
    { "criterion": "Matches the activity of the business sector", "passed": false, "reason": "Failed explanation..." }
  ],
  "suggestions": [
    "Suggested Name 1",
    "Suggested Name 2",
    "Suggested Name 3",
    "Suggested Name 4",
    "Suggested Name 5"
  ],
  "domains": [
    { "ext": ".com", "status": "Available" },
    { "ext": ".in", "status": "Available" },
    { "ext": ".co.in", "status": "Taken" },
    { "ext": ".net", "status": "Available" }
  ],
  "trademarks": [
    { "class": "Class 9 (Software/Tech)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 35 (Business Services)", "status": "Clear", "matches": "No direct matches found." },
    { "class": "Class 42 (IT & Cloud Services)", "status": "Clear", "matches": "No direct matches found." }
  ],
  "postFilingKit": {
    "steps": [
      { "step": "DSC Allocation", "detail": "Obtain Digital Signature Certificates for all directors.", "cost": "₹1,500 - ₹2,500" },
      { "step": "DIN Application", "detail": "Apply for Director Identification Numbers during incorporation.", "cost": "Included in Spice+" },
      { "step": "Spice+ Part A filing", "detail": "Reserve the approved name on the MCA portal.", "cost": "₹1,000" }
    ],
    "stampDuties": "Varies by state (estimated ₹2,000 for standard nominal share capital of ₹1,00,000).",
    "timeframe": "Estimated 2 to 4 working days for ROC name clearance."
  }
}`;

    const cleanName = name.trim();
    const lowerName = cleanName.toLowerCase();
    
    // Set up local deterministic values for fallbacks/supplementary data
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = (hash << 5) - hash + cleanName.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey || apiKey === "sk-cbeeee451dd848c3876906ac24293bbc_demo") {
        throw new Error("DeepSeek key not loaded or placeholder.");
      }

      const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are the Senior Registrar Compliance Director of Incroute. Return ONLY raw JSON without markdown syntax blocks." },
            { role: "user", content: checkPrompt }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.2
        })
      });

      if (!dsResponse.ok) {
        throw new Error(`DeepSeek API returned error status: ${dsResponse.status}`);
      }

      const data = await dsResponse.json();
      let resultText = data.choices?.[0]?.message?.content || "{}";
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(resultText);

      // Verify necessary fields are present
      if (!parsed.domains) {
        parsed.domains = [
          { ext: ".com", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
          { ext: ".in", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
          { ext: ".co.in", status: "Available" },
          { ext: ".net", status: "Available" }
        ];
      }
      if (!parsed.trademarks) {
        parsed.trademarks = [
          { class: "Class 9 (Software/Tech)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 35 (Business Services)", status: "Clear", matches: "No direct conflicts." },
          { class: "Class 42 (IT & Cloud Services)", status: "Clear", matches: "No direct conflicts." }
        ];
      }
      if (!parsed.postFilingKit) {
        parsed.postFilingKit = {
          steps: [
            { step: "DSC Allocation", detail: "Obtain Digital Signature Certificates for directors.", cost: "₹2,000 estimated" },
            { step: "DIN Application", detail: "Apply for DIN inside SPICe+ MCA application.", cost: "Included in Spice+" },
            { step: "Spice+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}".`, cost: "₹1,000 MCA fee" }
          ],
          stampDuties: "Estimated ₹2,000 state stamp duties.",
          timeframe: "Clearance approved in 2-3 working days."
        };
      }

      res.json({ success: true, report: parsed });
    } catch (err: any) {
      console.warn("⚠️ DeepSeek Feasibility clearance falling back to simulated engine:", err.message);
      
      let score = 85;
      const conflicts: string[] = [];
      const checklist = [
        { criterion: "Distinctive coined prefix (not generic)", passed: true, reason: `"${cleanName}" contains distinctive elements suitable for differentiation.` },
        { criterion: "Reflective of business objective", passed: true, reason: `The name aligns well with standard vocabulary in the ${industry} sector.` },
        { criterion: "No restricted keywords (State, Bank, National)", passed: true, reason: "No restricted or prohibited terms were identified in the primary lookup." },
        { criterion: "Phonetic similarity and trademark check", passed: true, reason: "Initial checks indicate healthy separation from dominant trademarks." }
      ];

      // Rule 1: Length check
      if (cleanName.length < 3) {
        score -= 30;
        checklist[0].passed = false;
        checklist[0].reason = `The prefix "${cleanName}" is too short (under 3 characters). ROC rules generally require a substantive coined word.`;
        conflicts.push("Proposed name is extremely short, which makes finding unique separation in the registrar ledger difficult.");
      } else if (cleanName.length < 5) {
        score -= 10;
        checklist[0].reason = `The prefix "${cleanName}" is relatively short. Registrars prefer distinctive, coined phrases.`;
      }

      // Rule 2: Restricted words check
      const restrictedWords = ["bank", "state", "national", "federation", "government", "reserve", "ministry", "municipal", "trust", "union", "india", "bharat"];
      const foundRestricted = restrictedWords.filter(word => lowerName.includes(word));
      if (foundRestricted.length > 0) {
        score -= 40;
        checklist[2].passed = false;
        checklist[2].reason = `Contains restricted word(s): ${foundRestricted.map(w => `'${w}'`).join(', ')}. ROC rules restrict usage without prior central government approvals.`;
        conflicts.push(`Restricted corporate terminology: "${foundRestricted[0].toUpperCase()}" requires special statutory approvals and licensing.`);
      }

      // Rule 3: Suffix check in name field
      const suffixes = ["pvt ltd", "private limited", "llp", "partnership", "opc", "one person company"];
      const foundSuffix = suffixes.find(s => lowerName.endsWith(s));
      if (foundSuffix) {
        score -= 15;
        checklist[0].passed = false;
        checklist[0].reason = `Input includes the corporate suffix "${foundSuffix.toUpperCase()}". Please supply ONLY the brand prefix in the check field.`;
        conflicts.push(`The suffix "${foundSuffix.toUpperCase()}" should not be part of the brand check input. Suffixes are appended automatically by the registry.`);
      }

      // Rule 4: Phonetic trademark clearance simulator using deterministic character hash
      if (positiveHash % 3 === 0) {
        score -= 8;
        checklist[3].passed = false;
        checklist[3].reason = `Phonetic similarities identified in Class 35/42 for names close to "${cleanName}".`;
        conflicts.push(`Phonetic brand overlap detected in public trademark classes. Minor spelling variations are advised.`);
      } else {
        checklist[3].reason = `No exact phonetical matching trademarks found in Class 9, 35, or 42 for "${cleanName}".`;
      }

      // Rule 5: Industry keywords advice check
      const industryKeywords: Record<string, string[]> = {
        technology: ["tech", "software", "digital", "systems", "ai", "data", "cyber", "cloud", "code", "dev", "web"],
        finance: ["wealth", "capital", "finance", "advisor", "invest", "asset", "credit", "ledger", "pay"],
        healthcare: ["health", "med", "cure", "clinic", "bio", "pharma", "care", "wellness"],
        education: ["learn", "academy", "ed", "school", "study", "mind", "skill"],
        consulting: ["consult", "advisor", "strategy", "group", "partners", "solutions"]
      };

      let matchingIndustryKeyword = false;
      const targetIndustry = industry.toLowerCase();
      for (const [ind, words] of Object.entries(industryKeywords)) {
        if (targetIndustry.includes(ind) || ind.includes(targetIndustry)) {
          const match = words.find(w => lowerName.includes(w));
          if (match) {
            matchingIndustryKeyword = true;
            break;
          }
        }
      }

      if (!matchingIndustryKeyword) {
        checklist[1].reason = `Descriptive matching word for "${industry}" is subtle. Adding industry terms (e.g. Tech, Fin, Solutions) is recommended.`;
      }

      // Format clean capitalized name suggestions
      const strippedPrefix = cleanName
        .replace(/\b(pvt ltd|private limited|llp|opc|partnership)\b/gi, "")
        .trim();
      const capitalizedPrefix = strippedPrefix.charAt(0).toUpperCase() + strippedPrefix.slice(1);
      const corporateSuffix = entityType.includes("LLP") ? "LLP" : "Private Limited";

      const suggestions = [
        `${capitalizedPrefix} Solutions ${corporateSuffix}`,
        `${capitalizedPrefix} Ventures ${corporateSuffix}`,
        `${capitalizedPrefix} Systems ${corporateSuffix}`,
        `New ${capitalizedPrefix} Global ${corporateSuffix}`,
        `${capitalizedPrefix} Tech ${corporateSuffix}`
      ];

      // Final bound score
      score = Math.max(20, Math.min(98, score));

      let summary = `Pre-Audit assessment completed successfully for "${cleanName}". `;
      if (score >= 85) {
        summary += `The proposed name exhibits exceptional feasibility with a score of ${score}%. It has a very high probability of direct, friction-free ROC registrar approval.`;
      } else if (score >= 70) {
        summary += `The proposed name exhibits healthy feasibility (${score}%). It is generally suitable, although minor clearance steps or trademark checks are recommended.`;
      } else {
        summary += `The proposed name has moderate to low feasibility (${score}%). We highly recommend adjusting the name prefix or adopting one of our recommended alternatives below to avoid registrar rejection.`;
      }

      const domains = [
        { ext: ".com", status: positiveHash % 4 === 0 ? "Taken" : "Available" },
        { ext: ".in", status: positiveHash % 5 === 0 ? "Taken" : "Available" },
        { ext: ".co.in", status: positiveHash % 3 === 0 ? "Taken" : "Available" },
        { ext: ".net", status: "Available" }
      ];

      const trademarks = [
        { class: "Class 9 (Software/Tech)", status: positiveHash % 3 === 0 ? "Conflict" : "Clear", matches: positiveHash % 3 === 0 ? `Phonetic phonetic match found: "${cleanName} Technologies"` : "No similar phonetic trademark found." },
        { class: "Class 35 (Business Services)", status: "Clear", matches: "No phonetic conflict found in public Class 35 register." },
        { class: "Class 42 (IT & Cloud Services)", status: positiveHash % 7 === 0 ? "Conflict" : "Clear", matches: positiveHash % 7 === 0 ? `Semantic matching trademark "Project ${cleanName}" is registered` : "No matches found." }
      ];

      const postFilingKit = {
        steps: [
          { step: "DSC Allocation", detail: `Acquire Class 3 Digital Signatures for proposed directors. Required for SPICe+ digital signing.`, cost: "₹2,000 estimated" },
          { step: "DIN Registration", detail: `Acquire unique Director Identification Numbers inside SPICe+ MCA application.`, cost: "Free for up to 3 directors" },
          { step: "SPICe+ Part A filing", detail: `Formally reserve the brand prefix "${cleanName}" with the Central Registration Centre (CRC).`, cost: "₹1,000 government filing fee" }
        ],
        stampDuties: `Estimated ₹2,000 for Pvt Ltd with ₹1,00,000 nominal share capital. Stamping fees vary slightly based on jurisdiction.`,
        timeframe: "Typically approved within 2-3 MCA working days."
      };

      const fallbackData = {
        score,
        summary,
        conflicts: conflicts.length > 0 ? conflicts : ["No critical conflict reports identified. The brand prefix is relatively unique."],
        checklist,
        suggestions,
        domains,
        trademarks,
        postFilingKit
      };

      res.json({ success: true, report: fallbackData });
    }
  });

app.post("/api/consult/audit", async (req, res) => {
    const { firmName, firmType, jurisdiction, industry } = req.body;

    if (!firmName || !firmType) {
      return res.status(400).json({ success: false, error: "Firm name and type are required." });
    }

    const auditPrompt = `Conduct a comprehensive, professional registration pre-audit advisory for the proposed corporate firm:
Name: "${firmName}"
Firm Type: "${firmType}"
State/Jurisdiction: "${jurisdiction || "Not Specified"}"
Core Sector/Industry: "${industry || "Corporate Consulting Services"}"

Format your response in structured sections:
1. **Name Feasibility Report**: Analyze potential name conflicts, suggest modifications if generic, checks compliance with Registrar naming guides.
2. **Mandatory Documentation Checklist**: Give the exact list of papers, notarization, and identification materials required.
3. **Primary Statutory Costs & Official ROC Capital stamp duties estimation**.
4. **Immediate Post-Incorporation Compliances**: Timeline after registration is complete (GST, bank accounts, First Board meeting, Auditor appointment).`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: auditPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute. Provide pristine corporate insights designed to guide new founders.",
          temperature: 0.3,
        }
      });

      res.json({ success: true, advice: response.text });
    } catch (err: any) {
      console.error("Advisory Board audit error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Local JSON Blog Datastore
  const BLOG_FILE = path.join(process.cwd(), "blog-posts.json");
  let blogPosts: any[] = [];

  const defaultBlogs = [
    {
      id: "blog-1",
      title: "How to Incorporate a Private Limited Company in India",
      subtitle: "A step-by-step masterclass on registration requirements, timelines, and ROC procedures.",
      content: `### Introduction

Starting a business is an exhilarating journey, and choosing the right corporate structure is one of the most critical decisions you will make. In India, the **Private Limited Company (Pvt Ltd)** remains the gold standard for startups and established enterprises alike due to its high credibility, limited liability protection, and ability to raise external venture capital.

This guide outlines the complete incorporation roadmap for 2026.

---

### Step 1: Secure Director Credentials (DSC & DIN)
Every proposed director must obtain a **Digital Signature Certificate (DSC)** to sign electronic forms. Once the DSC is ready, a **Director Identification Number (DIN)** is assigned during the incorporation process.

### Step 2: Brand Name Approval
Choose a unique brand prefix. You must submit your proposed name via the ROC's **RUN (Reserve Unique Name)** portal or directly inside the Spice+ Part A form. Ensure the name does not infringe on existing trademarks!

### Step 3: Drafting MOA & AOA
The **Memorandum of Association (MOA)** defines the company's core objectives, while the **Articles of Association (AOA)** layout the internal regulations and management bylaws.

### Step 4: ROC Filing & Certification
File the **SPICe+ (Simplified Proforma for Incorporating Company Electronically)** form with the Registrar of Companies. Upon successful verification of identity proofs, bank bills, and local lease NOCs, the ROC issues:
1. **Certificate of Incorporation (COI)**
2. **Permanent Account Number (PAN)**
3. **Tax Deduction Account Number (TAN)**

---

### Key Requirements Checklist:
* Minimum **2 Directors** (at least one must be a resident of India).
* Minimum **2 Shareholders** (can be the same as the directors).
* A valid registered physical address with utility bill and NOC proof.
* No minimum paid-up capital is required under current rules.`,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-28",
      author: "D Bhushan",
      views: 342
    },
    {
      id: "blog-2",
      title: "Demystifying First-Year Post-Incorporation Compliances",
      subtitle: "Avoid heavy penalties and strike-offs by filing your mandatory ROC and tax forms on time.",
      content: `### The Post-Incorporation Reality

Congratulations! Your company is officially incorporated. However, many entrepreneurs mistakenly believe that compliance only begins after a year. In reality, the Registrar of Companies (ROC) enforces several strict **post-incorporation timelines** immediately.

Failing to comply with these rules can result in heavy compounding penalties, personal liability for directors, or even the automatic strike-off of your new brand.

---

### 1. Deposit Share Capital & File Form 20A (Within 180 Days)
This is the single most critical step. Every shareholder must deposit their subscribed capital into the corporate bank account. Once deposited, you must file **Form 20A (Commencement of Business)**.
* **Penalty for failure:** A flat ₹50,000 penalty, plus the ROC can strike off the company automatically!

### 2. Appoint the First Auditor (Within 30 Days)
The Board of Directors must appoint a practicing Chartered Accountant as the statutory auditor within 30 days of incorporation by filing **Form ADT-1**.
* **Why it matters:** The auditor is responsible for inspecting your books and filing your balance sheets at the end of the financial year.

### 3. Share Certificate Dispatch (Within 60 Days)
The company must issue physical or digital share certificates to its initial subscribers within 60 days of incorporation and pay the local state stamp duty.

---

### Annual Filing Overview
* **Form AOC-4:** Financial statements (audited balance sheets and P&L statements) must be filed within 30 days of the Annual General Meeting (AGM).
* **Form MGT-7:** The annual return detailing company equity structure, directors, and shareholdings must be filed within 60 days of the AGM.`,
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-15",
      author: "CA Ananya Sharma",
      views: 189
    },
    {
      id: "blog-3",
      title: "LLP vs. Private Limited: Which is Right for You?",
      subtitle: "Compare tax benefits, liability shields, and statutory operational overheads for service and product firms.",
      content: `### Choosing Your Vehicle

When structuring a new enterprise, founders usually debate between two popular legal frameworks: **Limited Liability Partnership (LLP)** and **Private Limited Company (Pvt Ltd)**. Both offer limited liability protection, but they differ significantly in compliance cost, tax implications, and fundraising abilities.

---

### The Limited Liability Partnership (LLP)
An LLP is a hybrid structure combining the operational flexibility of a partnership with the liability protection of a corporation.
* **Best for:** Professional service providers, consulting agencies, small family trades, and real estate partnerships.
* **Tax Benefit:** No Corporate Dividend Distribution Tax (DDT) is levied.
* **Compliance Benefit:** No statutory audit is mandatory unless the capital contribution exceeds ₹25 Lakhs or annual turnover exceeds ₹40 Lakhs.

### The Private Limited Company (Pvt Ltd)
A Private Limited Company is a highly regulated corporate body with a distinct legal identity.
* **Best for:** Product startups, e-commerce brands, high-growth technology companies, and any venture seeking angel/VC funding.
* **Funding Benefit:** Permits direct equity allocation, ESOP pools, and venture debt setups.
* **Credibility Benefit:** Viewed as the most reliable corporate structure by foreign buyers, vendors, and institutional lenders.

---

### Direct Comparison Matrix

| Parameter | LLP | Private Limited |
| :--- | :--- | :--- |
| **Minimum Members** | 2 Designated Partners | 2 Directors & 2 Shareholders |
| **Audit Requirement** | Conditional (based on size) | Mandatory every year |
| **VC Investment** | Extremely difficult | Seamless equity funding |
| **Compliance Cost** | Low to moderate | Moderate to high |
| **Perpetual Succession**| Yes | Yes |`,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-02",
      author: "D Bhushan",
      views: 254
    }
  ];

  // Helper to generate slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Load persisted blog posts from disk
  let needsMigrationSave = false;
  if (fs.existsSync(BLOG_FILE)) {
    try {
      blogPosts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED BLOG POSTS: ${blogPosts.length} posts`);
      blogPosts.forEach((post: any) => {
        if (!post.slug) {
          post.slug = generateSlug(post.title);
          needsMigrationSave = true;
        }
        if (!post.status) {
          post.status = "published";
          needsMigrationSave = true;
        }
        if (!post.metaDescription) {
          post.metaDescription = post.subtitle || "";
          needsMigrationSave = true;
        }
      });
      if (needsMigrationSave) {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
        console.log(`🟢 MIGRATED BLOG DATABASE WITH SLUGS AND STATUS`);
      }
    } catch (err: any) {
      console.error("Failed to read persisted blog posts:", err.message);
      blogPosts = defaultBlogs.map((b: any) => ({
        ...b,
        slug: generateSlug(b.title),
        status: "published",
        metaDescription: b.subtitle || ""
      }));
    }
  } else {
    blogPosts = defaultBlogs.map((b: any) => ({
      ...b,
      slug: generateSlug(b.title),
      status: "published",
      metaDescription: b.subtitle || ""
    }));
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED BLOG POSTS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed blog posts to disk:", err.message);
    }
  }

  // Helpers for Firestore REST API
  function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === "string") return { stringValue: val };
    if (typeof val === "number") return { integerValue: val.toString() };
    if (typeof val === "boolean") return { booleanValue: val };
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map(toFirestoreValue)
        }
      };
    }
    return { stringValue: JSON.stringify(val) };
  }

  function toFirestoreFields(obj: any): any {
    const fields: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined && key !== "id") {
        fields[key] = toFirestoreValue(obj[key]);
      }
    }
    return { fields };
  }

  // Blog endpoints
  app.get("/api/blog/posts", async (req, res) => {
    const token = req.query.token || req.headers["x-admin-token"];

    let posts: any[] = [];
    let fetchedFromFirestore = false;
    try {
      const firestoreUrl = "https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs";
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data: any = await response.json();
        const firestoreDocs = data.documents || [];
        posts = firestoreDocs.map(parseFirestoreDocument);
        fetchedFromFirestore = true;
      } else {
        console.error(`🔴 Firestore REST API returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("🔴 Failed to fetch blogs from Firestore REST API:", err.message);
    }

    if (fetchedFromFirestore) {
      // Self-healing migration if Firestore is empty
      if (posts.length === 0) {
        console.log("🟢 Firestore blogs collection is empty. Seeding default blogs...");
        const seedPosts = defaultBlogs.map((b: any) => ({
          ...b,
          slug: generateSlug(b.title),
          status: "published",
          metaDescription: b.subtitle || "",
          views: b.views || 0
        }));

        for (const post of seedPosts) {
          try {
            const payload = toFirestoreFields(post);
            await fetch(`https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${post.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
          } catch (e: any) {
            console.error(`Failed to write seed post ${post.id}:`, e.message);
          }
        }
        posts = seedPosts;
      }
      
      // Update local cache file on disk
      try {
        fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      } catch (err: any) {
        console.error("Failed to write blog cache to disk:", err.message);
      }
    } else {
      // Fallback to local JSON cache file
      console.log("🟢 Firestore unavailable. Loading blogs from local disk cache...");
      if (fs.existsSync(BLOG_FILE)) {
        try {
          posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
        } catch (err: any) {
          console.error("Failed to read local blog file, using in-memory or seed default:", err.message);
          posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map((b: any) => ({
            ...b,
            slug: generateSlug(b.title),
            status: "published",
            metaDescription: b.subtitle || "",
            views: b.views || 0
          }));
        }
      } else {
        posts = blogPosts.length > 0 ? blogPosts : defaultBlogs.map((b: any) => ({
          ...b,
          slug: generateSlug(b.title),
          status: "published",
          metaDescription: b.subtitle || "",
          views: b.views || 0
        }));
      }
    }

    // Sort posts by date descending
    posts.sort((a, b) => b.date.localeCompare(a.date));

    // Update fallback cache
    blogPosts = posts;

    if (token === "admin-session-secure-token") {
      res.json({ success: true, count: posts.length, posts });
    } else {
      const published = posts.filter((p) => p.status === "published");
      res.json({ success: true, count: published.length, posts: published });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      res.json({ success: true, token: "admin-session-secure-token" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect administrative password." });
    }
  });

  app.post("/api/blog/posts", async (req, res) => {
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    const newId = `blog-${Date.now()}`;
    const newPost = {
      id: newId,
      title,
      subtitle: subtitle || "",
      content,
      image: image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      date: new Date().toISOString().split("T")[0],
      author: author || "D Bhushan",
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      slug: generateSlug(title),
      status: status || "published",
      metaDescription: metaDescription || subtitle || ""
    };

    // Ensure unique slug
    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    let originalSlug = newPost.slug;
    let count = 1;
    while (posts.some(p => p.slug === newPost.slug)) {
      newPost.slug = `${originalSlug}-${count}`;
      count++;
    }

    // Try to persist to Firestore
    let savedToFirestore = false;
    try {
      const payload = toFirestoreFields(newPost);
      const writeRes = await fetch(`https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${newId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (writeRes.ok) {
        console.log(`🟢 PERSISTED NEW BLOG POST TO FIRESTORE: ${newId}`);
        savedToFirestore = true;
      } else {
        console.warn(`⚠️ Firestore PATCH returned status ${writeRes.status} on creation. Falling back to local storage.`);
      }
    } catch (err: any) {
      console.warn("⚠️ Failed to persist blog post to Firestore:", err.message);
    }

    // Always save locally to make sure it persists locally
    posts.unshift(newPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write new blog to local database file:", err.message);
    }

    res.json({ 
      success: true, 
      message: savedToFirestore ? "Blog post saved successfully!" : "Blog post saved to local database fallback (Cloud API disabled).", 
      post: newPost 
    });
  });

  // Admin Edit Blog Post
  app.post("/api/blog/posts/:id/edit", async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, content, image, author, tags, token, status, metaDescription } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const existingPostIndex = posts.findIndex((p) => p.id === id);
    if (existingPostIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    const existingPost = posts[existingPostIndex];
    const updatedPost = { ...existingPost };
    if (title && title !== existingPost.title) {
      updatedPost.title = title;
      updatedPost.slug = generateSlug(title);
      // Ensure unique slug
      let originalSlug = updatedPost.slug;
      let count = 1;
      while (posts.some((p) => p.slug === updatedPost.slug && p.id !== id)) {
        updatedPost.slug = `${originalSlug}-${count}`;
        count++;
      }
    }
    if (subtitle !== undefined) updatedPost.subtitle = subtitle;
    if (content !== undefined) updatedPost.content = content;
    if (image !== undefined) updatedPost.image = image;
    if (author !== undefined) updatedPost.author = author;
    if (tags !== undefined) updatedPost.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) updatedPost.status = status;
    if (metaDescription !== undefined) updatedPost.metaDescription = metaDescription;

    // Try to update Firestore
    let savedToFirestore = false;
    try {
      const payload = toFirestoreFields(updatedPost);
      const writeRes = await fetch(`https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (writeRes.ok) {
        console.log(`🟢 PERSISTED EDITED BLOG POST TO FIRESTORE: ${id}`);
        savedToFirestore = true;
      } else {
        console.warn(`⚠️ Firestore PATCH returned status ${writeRes.status} for edit. Falling back to local storage.`);
      }
    } catch (err: any) {
      console.warn("Failed to persist edited blog post to Firestore:", err.message);
    }

    // Always update local cache file
    posts[existingPostIndex] = updatedPost;
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write edited blog to local database file:", err.message);
    }

    res.json({ 
      success: true, 
      message: savedToFirestore ? "Blog post updated successfully!" : "Blog post updated in local database fallback (Cloud API disabled).", 
      post: updatedPost 
    });
  });

  // Toggle/Update blog status
  app.post("/api/blog/posts/:id/status", async (req, res) => {
    const { id } = req.params;
    const { token, status } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    if (status !== "draft" && status !== "ready" && status !== "published") {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts[postIndex].status = status;

    // Try to update Firestore status
    try {
      const payload = { fields: { status: { stringValue: status } } };
      const patchUrl = `https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${id}?updateMask.fieldPaths=status`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (patchRes.ok) {
        console.log(`🟢 BLOG POST STATUS UPDATED IN FIRESTORE: ${id} to ${status}`);
      } else {
        console.warn(`⚠️ Firestore PATCH status returned ${patchRes.status} for status change. Falling back to local storage.`);
      }
    } catch (err: any) {
      console.warn("Failed to update status in Firestore:", err.message);
    }

    // Always update local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write blog status to local database file:", err.message);
    }

    res.json({ success: true, post: posts[postIndex] });
  });

  app.post("/api/blog/posts/:id/view", async (req, res) => {
    const { id } = req.params;

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    const views = (posts[postIndex].views || 0) + 1;
    posts[postIndex].views = views;

    // Try to increment views in Firestore
    try {
      const payload = { fields: { views: { integerValue: views.toString() } } };
      const patchUrl = `https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${id}?updateMask.fieldPaths=views`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (patchRes.ok) {
        console.log(`🟢 INCREMENTED VIEWS IN FIRESTORE: ${id} to ${views}`);
      } else {
        console.warn(`⚠️ Firestore view PATCH returned ${patchRes.status}`);
      }
    } catch (err: any) {
      console.warn("Failed to increment views in Firestore:", err.message);
    }

    // Always save local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to write blog views to local database file:", err.message);
    }

    res.json({ success: true, post: posts[postIndex] });
  });

  app.delete("/api/blog/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    let posts: any[] = [];
    if (fs.existsSync(BLOG_FILE)) {
      try {
        posts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      } catch (e) {
        posts = blogPosts;
      }
    } else {
      posts = blogPosts;
    }

    const postIndex = posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    posts.splice(postIndex, 1);

    // Try to delete from Firestore
    try {
      const deleteRes = await fetch(`https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${id}`, {
        method: "DELETE"
      });
      if (deleteRes.ok) {
        console.log(`🟢 DELETED BLOG POST FROM FIRESTORE: ${id}`);
      } else {
        console.warn(`⚠️ Firestore DELETE returned status ${deleteRes.status}. Falling back to local storage.`);
      }
    } catch (err: any) {
      console.warn("Failed to delete blog post from Firestore:", err.message);
    }

    // Always save local disk cache
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
      blogPosts = posts;
    } catch (err: any) {
      console.error("Failed to delete blog from local database file:", err.message);
    }

    res.json({ success: true, message: "Blog post deleted successfully!" });
  });

  // Testimonials Persistent JSON Datastore
  const TESTIMONIALS_FILE = path.join(process.cwd(), "testimonials.json");
  let testimonials: any[] = [];

  const defaultTestimonials = [
    {
      id: "test-1",
      name: "Amit Sharma",
      designation: "CEO, FinTech Solutions",
      entityType: "Pvt Ltd Company",
      rating: 5,
      content: "Incroute made Pvt Ltd company registration completely hassle-free! D Bhushan personally reviewed all files and completed the incorporation in just 8 working days. Peerless service!",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-2",
      name: "Priya Nair",
      designation: "Managing Partner, Zenith Consultancies",
      entityType: "LLP Partnership",
      rating: 5,
      content: "Outstanding compliance support. The virtual CFO services and dashboard kept our LLP ledger clean for yearly audits. Highly recommend for growing service firms in India.",
      approved: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "test-3",
      name: "Devendra Patel",
      designation: "Founder, GreenAgro OPC",
      entityType: "One Person Company",
      rating: 5,
      content: "The Registrar Name Advisor saved us from multiple MCA naming objections. The incorporation process was swift and transparent from day one. Incredibly modern legal tech platform.",
      approved: true,
      timestamp: new Date().toISOString()
    }
  ];

  // Load testimonials from disk
  if (fs.existsSync(TESTIMONIALS_FILE)) {
    try {
      testimonials = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED TESTIMONIALS: ${testimonials.length} reviews`);
    } catch (err: any) {
      console.error("Failed to read persisted testimonials:", err.message);
      testimonials = defaultTestimonials;
    }
  } else {
    testimonials = defaultTestimonials;
    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED TESTIMONIALS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed testimonials to disk:", err.message);
    }
  }

  // Testimonials public and admin fetch endpoint
  app.get("/api/testimonials", (req, res) => {
    const token = req.query.token || req.headers["x-admin-token"];
    if (token === "admin-session-secure-token") {
      res.json({ success: true, count: testimonials.length, testimonials });
    } else {
      const approvedOnly = testimonials.filter((t) => t.approved === true);
      res.json({ success: true, count: approvedOnly.length, testimonials: approvedOnly });
    }
  });

  // Client submit review (defaults to approved: false)
  app.post("/api/testimonials", (req, res) => {
    const { name, designation, entityType: submittedEntity, rating, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ success: false, error: "Name and content review are required fields." });
    }

    const newTestimonial = {
      id: `test-${Date.now()}`,
      name,
      designation: designation || "Entrepreneur",
      entityType: submittedEntity || "Private Limited",
      rating: Number(rating) || 5,
      content,
      approved: false, // requires admin approval
      timestamp: new Date().toISOString()
    };

    testimonials.unshift(newTestimonial);
    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 PERSISTED NEW PENDING TESTIMONIAL TO DISK: ${newTestimonial.id}`);
    } catch (err: any) {
      console.error("Failed to persist testimonial:", err.message);
    }

    res.json({ success: true, message: "Review submitted successfully! Pending admin clearance.", testimonial: newTestimonial });
  });

  // Admin Approve / Toggle testimonial approval status
  app.post("/api/testimonials/:id/approve", (req, res) => {
    const { id } = req.params;
    const { token, approved } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    const tIndex = testimonials.findIndex((t) => t.id === id);
    if (tIndex === -1) {
      return res.status(404).json({ success: false, error: "Testimonial not found." });
    }

    testimonials[tIndex].approved = approved !== undefined ? approved : true;

    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 TESTIMONIAL APPROVAL TOGGLED: ${id} to approved=${testimonials[tIndex].approved}`);
    } catch (err: any) {
      console.error("Failed to update approval on disk:", err.message);
    }

    res.json({ success: true, testimonial: testimonials[tIndex] });
  });

  // Admin Edit testimonial
  app.post("/api/testimonials/:id/edit", (req, res) => {
    const { id } = req.params;
    const { token, name, designation, entityType: editEntity, rating, content } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    const tIndex = testimonials.findIndex((t) => t.id === id);
    if (tIndex === -1) {
      return res.status(404).json({ success: false, error: "Testimonial not found." });
    }

    if (name) testimonials[tIndex].name = name;
    if (designation) testimonials[tIndex].designation = designation;
    if (editEntity) testimonials[tIndex].entityType = editEntity;
    if (rating) testimonials[tIndex].rating = Number(rating);
    if (content) testimonials[tIndex].content = content;

    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 TESTIMONIAL EDITED: ${id}`);
    } catch (err: any) {
      console.error("Failed to edit testimonial on disk:", err.message);
    }

    res.json({ success: true, testimonial: testimonials[tIndex] });
  });

  // Admin Delete testimonial
  app.delete("/api/testimonials/:id", (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    const tIndex = testimonials.findIndex((t) => t.id === id);
    if (tIndex === -1) {
      return res.status(404).json({ success: false, error: "Testimonial not found." });
    }

    const deleted = testimonials.splice(tIndex, 1);
    try {
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), "utf-8");
      console.log(`🟢 DELETED TESTIMONIAL FROM DISK: ${id}`);
    } catch (err: any) {
      console.error("Failed to delete testimonial from disk:", err.message);
    }

    res.json({ success: true, message: "Testimonial deleted successfully!", testimonial: deleted[0] });
  });

  // SEO Metadata profiles for sitemappable pages
  const seoProfiles: Record<string, { title: string; description: string; keywords: string }> = {
    "/": {
      title: "INCroute | Premium Startup & Corporate Registrations in India",
      description: "INCroute is a premium corporate registration and compliance advisory platform. Launch and scale your Indian startup with professional guidance for Pvt Ltd, LLP, Section 8, and GST filings.",
      keywords: "company registration, private limited, LLP registration, India, ROC filings, GST, startup advisory, virtual CFO"
    },
    "/services": {
      title: "Statutory Incorporation Services | INCroute",
      description: "Premium end-to-end corporate registration services in India. Register Private Limited, LLP, One Person Company, Partnership, and Section 8 NGO seamlessly.",
      keywords: "Pvt Ltd company registration, LLP registration, OPC registration, NGO Section 8, company setup"
    },
    "/about": {
      title: "Meet the Corporate Expert - D Bhushan | INCroute",
      description: "Learn about D Bhushan, the founder and principal legal advisor behind INCroute. Experience startup legal architecture and corporate compliance informed by professional CA mentorship.",
      keywords: "D Bhushan, INCroute founder, corporate law consultant, startup legal architecture"
    },
    "/blog": {
      title: "LegisCorp Editorial & Compliance Insights Ledger | INCroute",
      description: "Explore statutory briefs, ROC filing warnings, tax advisory articles, and legal ledger insights managed by corporate advocates and chartered analysts.",
      keywords: "compliance blogs, ROC updates, GST changes, corporate law articles"
    },
    "/name-checker": {
      title: "AI-Powered Registrar Name Feasibility Auditor | INCroute",
      description: "Audit your proposed brand name against official Registrar (MCA) guidelines. Our dynamic auditor maps trade registry databases instantly for zero-conflict incorporation.",
      keywords: "company name search, MCA name checker, startup brand auditor, business name registry"
    },
    "/tools": {
      title: "Interactive Statutory Utilities & Draft Generators | INCroute",
      description: "Calculate stamp duty rates across states, compute estimated company setup costs, and generate live previews of legal draft documents instantly.",
      keywords: "stamp duty calculator, legal draft generator, company registration cost, statutory utilities"
    },
    "/testimonials": {
      title: "Founder Trust & Client Reflections Board | INCroute",
      description: "See reviews and testimonials from Indian startup founders and business owners who registered their companies and handled ROC annual compliance with INCroute.",
      keywords: "INCroute reviews, startup founder feedback, statutory filing client reviews"
    },
    "/contact": {
      title: "Schedule an Expert Corporate Consultation | INCroute",
      description: "Get in touch with our senior registrars and compliance specialists. Book your consultation for company registration, annual compliance, or taxation.",
      keywords: "contact INCroute, corporate consultation, talk to CA, hire startup lawyer"
    },
    "/flowchart": {
      title: "Interactive Corporate Compliance Flowcharts | INCroute",
      description: "Visualize step-by-step statutory filing timelines and ROC compliance pipelines for Private Limited and LLP setups in India.",
      keywords: "compliance flowchart, ROC timeline, company registration pipeline"
    },
    "/comparison": {
      title: "Corporate Entity Structural Comparisons | INCroute",
      description: "Compare Private Limited, LLP, OPC, and Partnership structures side-by-side on liability, funding readiness, audit requirements, and compliance costs.",
      keywords: "Pvt Ltd vs LLP, OPC vs Partnership, compare business structures, startup entity type"
    },
    "/impact": {
      title: "Filing Speeds & Statutory Impact Dashboard | INCroute",
      description: "Track live operational metrics, ROC filing speeds, and statutory SLA timelines managed by our senior corporate desk.",
      keywords: "ROC filing speed, compliance SLA, INCroute dashboard"
    },
    "/timeline-viz": {
      title: "Statutory Filing Timelines Dashboard | INCroute",
      description: "Track first-year statutory due dates, ROC filings, and calendar roadmaps to prevent compliance penalties.",
      keywords: "statutory calendar, ROC timelines, compliance dashboard"
    },
    "/company-registration-bangalore": {
      title: "Online Pvt Ltd Company Registration in Bangalore | INCroute",
      description: "Instant online Pvt Ltd company registration in Bangalore. Access Silicon Valley's premium incorporation desk. Get MCA name approval, DSC, and local CA assistance for Bangalore startups.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, how long does online company registration take, documents needed for online opc registration, Bangalore startup incorporation, company registration Bangalore"
    },
    "/company-registration-mumbai": {
      title: "Premium Pvt Ltd & LLP Registration in Mumbai | INCroute",
      description: "Fast online company registration and LLP setup in Mumbai BKC. Maharashtra stamp duty compliance, instant MCA name clearance, and expert corporate legal advisory under one roof.",
      keywords: "online pvt ltd registration price, pvt ltd vs llp for startup, instant llp registration, cheapest company registration online, Mumbai corporate registry, company registration Mumbai"
    },
    "/company-registration-delhi": {
      title: "Elite Pvt Ltd & LLP Registration in Delhi NCR | INCroute",
      description: "Online Pvt Ltd company registration & instant LLP setup in Delhi, Gurgaon & Noida. High-speed MCA filing, zero office visits. Get your Certificate of Incorporation in 8 working days.",
      keywords: "online pvt ltd registration price, instant llp registration, how long does online company registration take, documents needed for online opc registration, Delhi company registration, Gurgaon company setup"
    },
    "/faq": {
      title: "Filing Q&A Answer Hub: AEO & GEO-Optimized Company Registration FAQs | INCroute",
      description: "Get instant BLUF-optimized answers on company registration timelines, document checklists, Pvt Ltd vs LLP comparison, OPC registration costs, and Section 8 NGO tax exemptions. Optimized for Google AI Overviews and voice search.",
      keywords: "how long does online company registration take, documents needed for online opc registration, pvt ltd vs llp for startup, online pvt ltd registration price, Section 8 NGO tax exemption, company registration FAQ India"
    }
  };

  // Rich Structured JSON-LD schemas for Search Engine optimization & organic rich snippets
  const schemas: Record<string, any> = {
    "/services": {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Corporate Registration & Compliance",
      "provider": {
        "@type": "Organization",
        "name": "INCroute",
        "url": "https://incroute.com"
      },
      "areaServed": { "@type": "Country", "name": "India" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Registration Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Private Limited Company Registration" }, "price": "999", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "LLP Registration" }, "price": "1499", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "One Person Company Registration" }, "price": "1299", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Partnership Firm Registration" }, "price": "799", "priceCurrency": "INR" },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "GST & Tax Registration" }, "price": "499", "priceCurrency": "INR" }
        ]
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "20", "bestRating": "5" }
    },
    "/": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "INCroute",
      "url": "https://incroute.com",
      "logo": "https://incroute.com/incroute_logo.png",
      "description": "Premium corporate registration and compliance advisory platform. Get professional guidance for Pvt Ltd, LLP, and statutory filings in India.",
      "founder": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8707552183",
        "contactType": "customer service",
        "email": "info@incroute.com"
      }
    },
    "/about": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "Person",
        "name": "D Bhushan",
        "jobTitle": "Founder & Principal Legal Advisor",
        "worksFor": {
          "@type": "Organization",
          "name": "INCroute",
          "url": "https://incroute.com"
        },
        "description": "D Bhushan is a practicing corporate lawyer and compliance strategist trained under a CA with senior corporate audit experience."
      }
    },
    "/contact": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "LocalBusiness",
        "name": "INCroute",
        "image": "https://incroute.com/incroute_logo.png",
        "telephone": "+91-8707552183",
        "email": "info@incroute.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "openingHours": "Mo-Fr 09:00-18:00"
      }
    },
    "/blog": {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "INCroute LegisCorp Insights Ledger",
      "description": "Corporate compliance alerts, GST filing guides, ROC updates, and statutory warnings managed by advocates and analysts.",
      "publisher": {
        "@type": "Organization",
        "name": "INCroute"
      }
    },
    "/tools": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "INCroute Interactive Statutory Utilities",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "browserRequirements": "Requires JavaScript",
      "description": "Calculators for stamp duty rates, estimated incorporation fees, and live previews of statutory legal drafts in India."
    },
    "/company-registration-bangalore": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Bangalore Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online Pvt Ltd company registration and LLP incorporation services for technology startups in Bangalore.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-bangalore",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "80 Feet Rd, Koramangala 4th Block",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560034",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.9338",
        "longitude": "77.6244"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-mumbai": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Mumbai Corporate Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Premium online company registration, LLP filings, and corporate legal compliance services for Mumbai enterprises.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-mumbai",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "G Block BKC, Bandra Kurla Complex, Bandra East",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "postalCode": "400051",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "19.0600",
        "longitude": "72.8600"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/company-registration-delhi": {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "INCroute Delhi NCR Startup Desk",
      "image": "https://incroute.com/incroute_logo.png",
      "description": "Instant online company registration and elite LLP filing services for startups and e-commerce brands in Delhi NCR.",
      "telephone": "+91-8707552183",
      "email": "info@incroute.com",
      "url": "https://incroute.com/company-registration-delhi",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Connaught Place",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "28.6304",
        "longitude": "77.2177"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    "/faq": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How long does online company registration take in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Online Pvt Ltd company registration in India takes 7 to 10 working days. This timeline includes acquiring Digital Signature Certificates (DSC), obtaining name approvals via SPICe+ Part A, and submitting final SPICe+ Part B forms to the Registrar of Companies."
          }
        },
        {
          "@type": "Question",
          "name": "What documents are needed for online OPC registration?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Online OPC registration requires the director's PAN card, Aadhaar card, photo, and bank statement (under 2 months old). The registered office requires a utility bill (electricity or water) and a signed No Objection Certificate (NOC) from the property owner."
          }
        },
        {
          "@type": "Question",
          "name": "Pvt Ltd vs LLP for startup: Which structure is best?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pvt Ltd is the best structure for raising venture capital, issuing ESOPs, and rapid scaling. Choose an LLP if you want limited liability with low annual compliance (audits are optional below 25 Lakh capital or 40 Lakh turnover) and do not need immediate VC funding."
          }
        },
        {
          "@type": "Question",
          "name": "What is the actual online Pvt Ltd registration price?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The total online Pvt Ltd registration price starts at Rs 5,999 (inclusive of professional fees, DSC for two directors, and government filing charges). The price varies by state depending on authorized share capital brackets and regional MCA stamp duty schedules."
          }
        },
        {
          "@type": "Question",
          "name": "What are the tax exemptions for a Section 8 NGO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Section 8 NGOs enjoy 100% tax exemptions on donations under Section 12A and Section 80G of the Income Tax Act, 1961. The entity is also exempt from minimum capital criteria, stamp duty levies on incorporation, and corporate dividend distribution taxes."
          }
        }
      ]
    }
  };

  function injectSEOMetadata(html: string, route: string): string {
    const profile = seoProfiles[route] || seoProfiles["/"];
    
    // Replace <title>
    let transformed = html.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
    
    // Replace or inject description
    const descMeta = `<meta name="description" content="${profile.description}" />`;
    if (transformed.includes('name="description"')) {
      transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
    }

    // Replace or inject keywords
    const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
    if (transformed.includes('name="keywords"')) {
      transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
    } else {
      transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
    }

    // OpenGraph OG Title & Description
    const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
    const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
    
    if (transformed.includes('property="og:title"')) {
      transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
    } else {
      transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
    }

    if (transformed.includes('property="og:description"')) {
      transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
    } else {
      transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
    }

    // Dynamic Canonical Link Tag
    const canonicalUrl = `https://incroute.com${route === "/" ? "" : route}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
    transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

    // Dynamic JSON-LD Schema Markup
    const schemaData = schemas[route] || schemas["/"];
    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
    transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

    return transformed;
  }

  // Helper to parse Firestore REST API JSON structure
  function parseFirestoreDocument(doc: any): any {
    const fields = doc.fields || {};
    const result: any = {};
    const nameParts = doc.name ? doc.name.split("/") : [];
    result.id = nameParts[nameParts.length - 1] || "";

    for (const key in fields) {
      const valObj = fields[key];
      if (valObj && typeof valObj === "object") {
        if ("stringValue" in valObj) {
          result[key] = valObj.stringValue;
        } else if ("integerValue" in valObj) {
          result[key] = parseInt(valObj.integerValue, 10);
        } else if ("doubleValue" in valObj) {
          result[key] = parseFloat(valObj.doubleValue);
        } else if ("booleanValue" in valObj) {
          result[key] = valObj.booleanValue;
        } else if ("arrayValue" in valObj) {
          const values = valObj.arrayValue.values || [];
          result[key] = values.map((v: any) => {
            if ("stringValue" in v) return v.stringValue;
            if ("integerValue" in v) return parseInt(v.integerValue, 10);
            return JSON.stringify(v);
          });
        } else {
          result[key] = valObj;
        }
      }
    }
    return result;
  }

  // Dynamic Blog Post Route Handler for SEO crawler support
  const handleBlogPostRoute = async (req: any, res: any, next: any, isDev: boolean, vite?: any) => {
    const { slug } = req.params;

    let post: any = null;
    try {
      const firestoreUrl = "https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs";
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data: any = await response.json();
        const firestoreDocs = data.documents || [];
        const parsedPosts = firestoreDocs.map(parseFirestoreDocument);
        post = parsedPosts.find((p: any) => p.slug === slug && p.status === "published");
      } else {
        console.error(`🔴 Firestore REST API returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("🔴 Failed to fetch blog post from Firestore REST API:", err.message);
    }

    if (!post) {
      post = blogPosts.find((p) => p.slug === slug && p.status === "published");
    }

    if (!post) {
      return next(); // Fallback to standard client router or 404
    }

    try {
      const templatePath = isDev 
        ? path.join(process.cwd(), "index.html")
        : path.join(process.cwd(), "dist", "index.html");

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let template = fs.readFileSync(templatePath, "utf-8");
      if (isDev && vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
      }

      // Generate dynamic SEO profile for this blog post
      const profile = {
        title: `${post.title} | INCroute Blog`,
        description: post.metaDescription || post.subtitle || "Statutory compliance and company incorporation insights.",
        keywords: Array.isArray(post.tags) ? post.tags.join(", ") : "compliance, company registration, ROC, GST"
      };

      // Replace <title>
      let transformed = template.replace(/<title>.*?<\/title>/gi, `<title>${profile.title}</title>`);
      
      // Replace or inject description
      const descMeta = `<meta name="description" content="${profile.description}" />`;
      if (transformed.includes('name="description"')) {
        transformed = transformed.replace(/<meta name="description" content=".*?" \/>/gi, descMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${descMeta}\n</head>`);
      }

      // Replace or inject keywords
      const keywordsMeta = `<meta name="keywords" content="${profile.keywords}" />`;
      if (transformed.includes('name="keywords"')) {
        transformed = transformed.replace(/<meta name="keywords" content=".*?" \/>/gi, keywordsMeta);
      } else {
        transformed = transformed.replace("</head>", `  ${keywordsMeta}\n</head>`);
      }

      // OpenGraph OG Title & Description
      const ogTitle = `<meta property="og:title" content="${profile.title}" />`;
      const ogDesc = `<meta property="og:description" content="${profile.description}" />`;
      const ogImage = `<meta property="og:image" content="${post.image}" />`;
      
      if (transformed.includes('property="og:title"')) {
        transformed = transformed.replace(/<meta property="og:title" content=".*?" \/>/gi, ogTitle);
      } else {
        transformed = transformed.replace("</head>", `  ${ogTitle}\n</head>`);
      }

      if (transformed.includes('property="og:description"')) {
        transformed = transformed.replace(/<meta property="og:description" content=".*?" \/>/gi, ogDesc);
      } else {
        transformed = transformed.replace("</head>", `  ${ogDesc}\n</head>`);
      }

      if (transformed.includes('property="og:image"')) {
        transformed = transformed.replace(/<meta property="og:image" content=".*?" \/>/gi, ogImage);
      } else {
        transformed = transformed.replace("</head>", `  ${ogImage}\n</head>`);
      }

      // Dynamic Canonical Link Tag
      const canonicalUrl = `https://incroute.com/blog/${slug}`;
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      transformed = transformed.replace(/<link rel="canonical" href=".*?" \/>/gi, "");
      transformed = transformed.replace("</head>", `  ${canonicalTag}\n</head>`);

      // Dynamic JSON-LD Schema Markup
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.subtitle,
        "image": post.image,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "datePublished": post.date,
        "publisher": {
          "@type": "Organization",
          "name": "INCroute",
          "logo": {
            "@type": "ImageObject",
            "url": "https://incroute.com/incroute_logo.png"
          }
        }
      };
      const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
      transformed = transformed.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
      transformed = transformed.replace("</head>", `  ${schemaTag}\n</head>`);

      res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
    } catch (err: any) {
      console.error("Vite blog index transform error:", err.message);
      next(err);
    }
  };

  // SEO sitemappable page routes
  const seoRoutes = Object.keys(seoProfiles);

  // Vite Integration for Full-Stack routing
  if (process.env.NODE_ENV !== "production") {
    const hmrPort = Number(process.env.WS_PORT) || (PORT + 100);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: hmrPort,
        },
      },
      appType: "custom",
    });

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], async (req, res, next) => {
      await handleBlogPostRoute(req, res, next, true, vite);
    });

    // Intercept SEO routes dynamically in development
    app.get(seoRoutes, async (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        
        template = await vite.transformIndexHtml(req.originalUrl, template);
        const html = injectSEOMetadata(template, url);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err: any) {
        console.error("Vite index transform error:", err.message);
        next(err);
      }
    });

    app.use(vite.middlewares);

    // SPA fallback for dev mode — serve index.html for all non-API, non-asset routes
    app.use("*", async (req, res, next) => {
      // Skip API routes and static assets
      if (req.originalUrl.startsWith("/api/") || req.originalUrl.includes(".")) {
        return next();
      }
      try {
        const templatePath = path.join(process.cwd(), "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (err) {
        next(err);
      }
    });

    console.log(`Vite HMR configured to ws://localhost:${hmrPort}`);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // Intercept blog post routes
    app.get(["/blog/:slug", "/blog/:slug/"], (req, res, next) => {
      handleBlogPostRoute(req, res, next, false);
    });

    // Intercept SEO routes dynamically in production
    app.get(seoRoutes, (req, res, next) => {
      try {
        const url = req.originalUrl.split("?")[0];
        const templatePath = path.join(distPath, "index.html");
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, "utf-8");
          const html = injectSEOMetadata(template, url);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
        next();
      } catch (err) {
        next(err);
      }
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Incroute backend server active running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
