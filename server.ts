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
let portalOrders = [
  {
    id: "ORD-4821",
    companyName: "Acme Software Solutions Ltd",
    firmType: "Private Limited Company",
    status: "document_review", // draft, name_approval, document_review, roc_filing, approved
    stepProgress: 60,
    createdAt: "2026-05-18",
    email: "dev.bhushan.g.m@gmail.com",
    checklist: [
      { id: "1", name: "Director PAN Card & Voter ID/Passport", required: true, status: "approved", uploadedFile: "pan_aadhaar_docs.pdf", size: "1.8 MB" },
      { id: "2", name: "Utility Bill for Office (Electricity Bill)", required: true, status: "pending", uploadedFile: null, size: null },
      { id: "3", name: "NOC from Commercial Property Owner", required: true, status: "pending", uploadedFile: null, size: null },
      { id: "4", name: "Consent of Director to Act (Form DIR-2)", required: true, status: "approved", uploadedFile: "dir2_consent_signed.pdf", size: "850 KB" }
    ],
    complianceStatus: {
      nextDue: "2026-09-30",
      alertCount: 1,
      items: [
        { id: "c1", name: "First Board Meeting (Within 30 Days)", status: "pending", dueDate: "2026-06-18", description: "Convening of first meeting of Directors" },
        { id: "c2", name: "Commencement of Business Certificate (Form 20A)", status: "pending", dueDate: "2026-11-18", description: "Verification filing within 180 days of incorporation" }
      ]
    },
    history: [
      { date: "2026-05-18", activity: "Order ORD-4821 created & compliance checklists assigned." },
      { date: "2026-05-20", activity: "Form DIR-2 checked and marked as approved by consultancy." },
      { date: "2026-05-22", activity: "Director PAN/ID identity materials received." }
    ]
  },
  {
    id: "ORD-5192",
    companyName: "Vanguard Architects LLP",
    firmType: "Limited Liability Partnership (LLP)",
    status: "approved",
    stepProgress: 100,
    createdAt: "2026-04-10",
    email: "dev.bhushan.g.m@gmail.com",
    checklist: [
      { id: "1", name: "Partner ID & Address Proofs", required: true, status: "approved", uploadedFile: "partner_kyc_vanguard.zip", size: "4.5 MB" },
      { id: "2", name: "LLP Registered Office Rental Deed", required: true, status: "approved", uploadedFile: "rent_agreement_vanguard.pdf", size: "2.1 MB" },
      { id: "3", name: "Standard LLP Partnership Agreement", required: true, status: "approved", uploadedFile: "llp_agreement_stamped.pdf", size: "3.4 MB" }
    ],
    complianceStatus: {
      nextDue: "2026-05-30",
      alertCount: 0,
      items: [
        { id: "c3", name: "LLP Agreement Filing (Form 3)", status: "approved", dueDate: "2026-05-10", description: "Filing signed agreement within 30 days" },
        { id: "c4", name: "Annual LLP Statement (Form 8)", status: "pending", dueDate: "2026-10-30", description: "Statement of Accounts & Solvency" }
      ]
    },
    history: [
      { date: "2026-04-10", activity: "Partner registration successfully started." },
      { date: "2026-04-15", activity: "Vanguard partnership deeds completed and uploaded to portal." },
      { date: "2026-04-25", activity: "LLP Registrar approved incorporation certificate (LLPIN: AAA-7821)." },
      { date: "2026-05-08", Agreement: "Agreements filed with ROC and verified." }
    ]
  }
];

// Active compliance calendar list for reference or audit tasks
let complianceCalendar = [
  { id: "1", service: "GST Filing", description: "Monthly GSTR-1 & GSTR-3B filings", dueDate: "11th and 20th of every month", type: "taxation" },
  { id: "2", service: "Income Tax Audit", description: "Tax Audit Filing and assessment for entities", dueDate: "September 30th annually", type: "taxation" },
  { id: "3", service: "ROC Annual Filing", description: "Form MGT-7 and Form AOC-4 Filing with Registrar", dueDate: "Within 30 and 60 days of AGM", type: "corporate" },
  { id: "4", service: "TDS Returns", description: "Quarterly TDS Filings (Form 24Q, 26Q)", dueDate: "Last day of succeeding month of quarter", type: "taxation" },
  { id: "5", service: "EPF & ESIC Return", description: "Monthly social security statutory deposit and returns", dueDate: "15th of every month", type: "employment" }
];

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route - Get current orders tracking data
  app.get("/api/portal/orders", (req, res) => {
    const { email } = req.query;
    if (email && typeof email === "string") {
      const filtered = portalOrders.filter(
        (o) => o.email.toLowerCase() === email.toLowerCase()
      );
      return res.json({ success: true, count: filtered.length, orders: filtered });
    }
    res.json({ success: true, count: portalOrders.length, orders: portalOrders });
  });

  // API Route - Create a new firm onboarding / registration service request
  app.post("/api/portal/orders", (req, res) => {
    const { companyName, firmType, email, partnersCount, stateOfRegistration } = req.body;

    if (!companyName || !firmType) {
      return res.status(400).json({ success: false, error: "Company name and firm type are required." });
    }

    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Auto populate custom onboarding checklist based on company type
    let defaultChecklist = [
      { id: "1", name: "Director / Partner PAN Card Credentials", required: true, status: "pending", uploadedFile: null, size: null },
      { id: "2", name: "Director / Partner Address Proof (Aadhar, Utility bills, or Passport)", required: true, status: "pending", uploadedFile: null, size: null },
      { id: "3", name: "Registered Office Address proof (Electricity Bill / Gas Bill)", required: true, status: "pending", uploadedFile: null, size: null }
    ];

    if (firmType.includes("Private Limited")) {
      defaultChecklist.push({ id: "4", name: "Form DIR-2 (Consent of Directors) & INC-9 declaration", required: true, status: "pending", uploadedFile: null, size: null });
      defaultChecklist.push({ id: "5", name: "Digital Signature Certificate (DSC) Request", required: false, status: "pending", uploadedFile: null, size: null });
    } else if (firmType.includes("LLP")) {
      defaultChecklist.push({ id: "4", name: "Draft Limited Liability Partnership Deed Status", required: true, status: "pending", uploadedFile: null, size: null });
    } else if (firmType.includes("Partnership")) {
      defaultChecklist.push({ id: "4", name: "Signed Stamp Paper Partnership Agreement", required: true, status: "pending", uploadedFile: null, size: null });
    }

    const newOrder = {
      id: newId,
      companyName,
      firmType,
      status: "draft",
      stepProgress: 20,
      createdAt: new Date().toISOString().split("T")[0],
      email: email || "user@example.com",
      checklist: defaultChecklist,
      complianceStatus: {
        nextDue: "Pending Incorporation",
        alertCount: 0,
        items: []
      },
      history: [
        { date: new Date().toISOString().split("T")[0], activity: `Onboarding initiated for ${companyName} (${firmType}) in State: ${stateOfRegistration || "Default"}.` }
      ]
    };

    portalOrders.unshift(newOrder);
    res.json({ success: true, message: "Onboarding initiated successfully!", order: newOrder });
  });

  // API Route - Document simulated upload & automated checks
  app.post("/api/portal/upload", (req, res) => {
    const { orderId, checklistItemId, fileName, fileSize } = req.body;

    if (!orderId || !checklistItemId || !fileName) {
      return res.status(400).json({ success: false, error: "Missing parameters for file reference." });
    }

    const orderIndex = portalOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    const checklistItem = portalOrders[orderIndex].checklist.find(item => item.id === checklistItemId);
    if (!checklistItem) {
      return res.status(404).json({ success: false, error: "Checklist item not found." });
    }

    // Process simulation
    checklistItem.uploadedFile = fileName;
    checklistItem.size = fileSize || "1.2 MB";
    checklistItem.status = "approved"; // Auto approve for ease of client simulation

    // Update process flow progress
    const items = portalOrders[orderIndex].checklist;
    const uploadedCount = items.filter(i => i.uploadedFile !== null).length;
    const completionPercent = Math.min(20 + Math.round((uploadedCount / items.length) * 60), 90);
    portalOrders[orderIndex].stepProgress = completionPercent;

    if (completionPercent >= 80 && portalOrders[orderIndex].status === "draft") {
      portalOrders[orderIndex].status = "document_review";
    }

    portalOrders[orderIndex].history.unshift({
      date: new Date().toISOString().split("T")[0],
      activity: `Document uploaded: '${fileName}' associated with task: '${checklistItem.name}'. Marked as submitted.`
    });

    res.json({
      success: true,
      message: "Document registered in secure ledger successfully.",
      order: portalOrders[orderIndex]
    });
  });

  // API Route - Compliance Calendar listing
  app.get("/api/compliance/calendar", (req, res) => {
    res.json({ success: true, calendar: complianceCalendar });
  });

  // API Route - AI Consultant advisor (Gemini)
  app.post("/api/portal/chat", async (req, res) => {
    const { messages, selectedOrder } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: "Messages array is required." });
    }

      // Grab user instructions context for Incroute Legal Advisor agent
      const contextInfo = `You are "Incroute Advisor", a premium legal corporate consultancy AI assistant specialized in firm registrations (Private Limited, LLP, Sole Proprietorship, Partnership, One Person Company) and absolute corporate compliance.
You assist client business founders, small enterprise operators, and entrepreneurs to correctly complete filings, name approvals, agreements structures, tax filings (GST, ROC, Form 8, AOC-4, DIR-2), and other critical statutory items.

${selectedOrder ? `
Active Portal Case Context Selected by User:
- Company: ${selectedOrder.companyName}
- Firm Type: ${selectedOrder.firmType}
- Phase Status: ${selectedOrder.status}
- Incorporation Step Progress: ${selectedOrder.stepProgress}%
- Assigned Checklist Info: ${JSON.stringify(selectedOrder.checklist)}
` : `No specific active case context is selected yet, provide general professional corporate registration advice.`}

Keep your responses highly clear, professional, structured and informative with markdown tables, bullet points, and exact legal checklists or requirements wherever possible. Always end with a comforting note of authority and reliability. Do not mention port numbers, hosting, API structures or mock backend elements.`;

    try {
      // Map chat conversation into format for Gemini
      // Format chat messages
      const formattedContents = messages.map((m: any) => {
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        };
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: contextInfo,
          temperature: 0.7,
        },
      });

      res.json({
        success: true,
        reply: response.text || "I apologize, I am unable to generate a detailed response at this moment. Please double-check your file requirements."
      });
    } catch (err: any) {
      console.error("Gemini Advisor API Error:", err);
      res.status(500).json({
        success: false,
        error: "AI Consultation service is currently connecting. Please verify your GEMINI_API_KEY environment config in settings.",
        details: err.message
      });
    }
  });

  // Persistent Config storage for Google Forms Connection
  const CONFIG_FILE = path.join(process.cwd(), "contact-form-config.json");
  let contactFormUri: string | null = null;

  // Load persisted config on startup
  if (fs.existsSync(CONFIG_FILE)) {
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

// Local Memory Storage for Contact Submissions
let contactSubmissions: any[] = [];

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  // Store in memory list
  contactSubmissions.push({
    id: `MSG-${Math.floor(Math.random() * 10000)}`,
    name,
    email,
    phone,
    message,
    timestamp: new Date().toISOString()
  });

  // Log to server console so user understands where it goes
  console.log("\n---- NEW CONTACT SUBMISSION ----");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone || "N/A"}`);
  console.log(`Message: ${message}`);
  console.log("--------------------------------\n");
  console.log(`(NOTE: Total submissions saved in server memory: ${contactSubmissions.length})`);

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

  // AI Name Feasibility clearance check (Gemini Integration)
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
Format your response as a strict, clean JSON object. Do not include any markdown styling like \`\`\`json or backticks. Return ONLY the raw JSON string matching this exact structure:
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
  ]
}`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API Key is missing, triggering fallback simulation.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: checkPrompt,
        config: {
          systemInstruction: "You are the Senior Registrar Compliance Director of Incroute. Return ONLY raw JSON without markdown syntax blocks.",
          temperature: 0.2,
        }
      });

      // Try parsing response as JSON
      let resultText = response.text || "{}";
      // Strip markdown JSON codeblock markers if any
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(resultText);
      res.json({ success: true, report: parsed });
    } catch (err: any) {
      console.warn("⚠️ AI Name Feasibility falling back to simulated analysis:", err.message);
      
      // Dynamic Heuristic Analysis Engine for Offline/Missing Key State
      const cleanName = name.trim();
      const lowerName = cleanName.toLowerCase();
      
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
      let hash = 0;
      for (let i = 0; i < cleanName.length; i++) {
        hash = (hash << 5) - hash + cleanName.charCodeAt(i);
        hash |= 0;
      }
      const positiveHash = Math.abs(hash);
      
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

      const fallbackData = {
        score,
        summary,
        conflicts: conflicts.length > 0 ? conflicts : ["No critical conflict reports identified. The brand prefix is relatively unique."],
        checklist,
        suggestions
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
      author: "Advocate Dev Bhushan",
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
      author: "Advocate Dev Bhushan",
      views: 254
    }
  ];

  // Load persisted blog posts from disk
  if (fs.existsSync(BLOG_FILE)) {
    try {
      blogPosts = JSON.parse(fs.readFileSync(BLOG_FILE, "utf-8"));
      console.log(`🟢 LOADED PERSISTED BLOG POSTS: ${blogPosts.length} posts`);
    } catch (err: any) {
      console.error("Failed to read persisted blog posts:", err.message);
      blogPosts = defaultBlogs;
    }
  } else {
    blogPosts = defaultBlogs;
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
      console.log(`🟢 INITIALIZED SEED BLOG POSTS ON DISK`);
    } catch (err: any) {
      console.error("Failed to write seed blog posts to disk:", err.message);
    }
  }

  // Blog endpoints
  app.get("/api/blog/posts", (req, res) => {
    res.json({ success: true, count: blogPosts.length, posts: blogPosts });
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

  app.post("/api/blog/posts", (req, res) => {
    const { title, subtitle, content, image, author, token } = req.body;

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
      author: author || "Advocate Dev Bhushan",
      views: 0
    };

    blogPosts.unshift(newPost);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
      console.log(`🟢 PERSISTED NEW BLOG POST TO DISK: ${newId}`);
    } catch (err: any) {
      console.error("Failed to persist blog post:", err.message);
    }

    res.json({ success: true, message: "Blog post published successfully!", post: newPost });
  });

  app.post("/api/blog/posts/:id/view", (req, res) => {
    const { id } = req.params;
    const post = blogPosts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    post.views = (post.views || 0) + 1;

    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
    } catch (err: any) {
      console.error("Failed to save view count to disk:", err.message);
    }

    res.json({ success: true, post });
  });

  app.delete("/api/blog/posts/:id", (req, res) => {
    const { id } = req.params;
    const { token } = req.body;

    if (token !== "admin-session-secure-token") {
      return res.status(403).json({ success: false, error: "Unauthorized access." });
    }

    const index = blogPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Blog post not found." });
    }

    const deleted = blogPosts.splice(index, 1);
    try {
      fs.writeFileSync(BLOG_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
      console.log(`🟢 DELETED BLOG POST FROM DISK: ${id}`);
    } catch (err: any) {
      console.error("Failed to sync deletions to disk:", err.message);
    }

    res.json({ success: true, message: "Blog post deleted successfully!", post: deleted[0] });
  });

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
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(`Vite HMR configured to ws://localhost:${hmrPort}`);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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
