import { documentTemplates } from "../data/documentTemplates";

const fillField = (val: string | undefined, label: string) => {
  return val && val.trim() !== "" ? val.trim() : `[${label.toUpperCase()}]`;
};

export function generateDraftText(templateId: string, fields: Record<string, string>): string {
  const template = documentTemplates.find(t => t.id === templateId);
  if (!template) return "Document draft template not found.";

  const getVal = (fieldId: string, label: string) => {
    return fillField(fields[fieldId], label);
  };

  const docDate = getVal("docDate", "Date of Execution");
  const docPlace = getVal("docPlace", "Place of Execution");

  switch (templateId) {
    case "office-noc": {
      const company = getVal("proposedName", "Proposed Company Name");
      const director = getVal("applicantName", "Applicant or Director Name");
      const owner = getVal("ownerName", "Property Owner Name");
      const address = getVal("premisesAddress", "Full Leased Property Address");
      const rel = fields["relationship"] === "Other"
        ? getVal("otherRelationship", "Lease Relationship")
        : getVal("relationship", "Lease Relationship");
      const block = fields["propertyDescription"] ? ` described as ${fields["propertyDescription"]}` : "";

      return `NO OBJECTION CERTIFICATE

TO WHOMSOEVER IT MAY CONCERN

I, ${owner}, sole owner and legal possessor of the commercial premises situated at:
${address}${block}

Do hereby declare and state under no duress that:

1. I am the absolute legal owner of the aforementioned property and have full authority to execute this No Objection Certificate.

2. I have granted full authorization and license to ${director} in the capacity of ${rel} to utilize the registered commercial address of the property as the "Registered Office Address" of their proposed corporate entity under the name of:
   M/S ${company} PRIVATE LIMITED / LLP

3. I solemnly affirm that I have no objection to the Registrar of Companies (ROC), Ministry of Corporate Affairs, or statutory tax authorities registering the proposed company at this property location.

4. I further declare that I have no financial interest, debt liability, or regulatory conflict with the operations of the proposed company.

Signed, Sealed, and Executed on this ${docDate} at ${docPlace}.

____________________________
(${owner})
Property Owner & Declarant`;
    }

    case "founders-deed": {
      const brand = getVal("proposedName", "Proposed Brand Prefix");
      const fA = getVal("founderA", "Founder A Name");
      const fB = getVal("founderB", "Founder B Name");
      const split = fields["equitySplit"] === "Custom"
        ? getVal("customSplit", "Custom Ratio")
        : fields["equitySplit"] || "50/50";
      
      const [splitA, splitB] = split.includes("/") ? split.split("/") : ["50", "50"];
      const vesting = fields["vestingEnabled"] === "true" || fields["vestingEnabled"] === undefined
        ? "All founder shares shall vest over a 4-year period (48 months), subject to a 1-year (12 months) cliff."
        : "No vesting schedule applies. All shares are fully vested upon incorporation.";

      return `FOUNDERS' CO-FOUNDER AGREEMENT

THIS AGREEMENT is entered into this ${docDate} at ${docPlace} by and between:
1. ${fA} ("Founder A")
2. ${fB} ("Founder B")

WHEREAS the Founders intend to incorporate and launch a business under the proposed brand prefix:
M/S ${brand} PRIVATE LIMITED ("The Company")

IT IS AGREED BY THE FOUNDERS AS FOLLOWS:

1. EQUITY & SHAREHOLDING ALLOCATION:
   • Founder A (${fA}): ${splitA}% Shareholding
   • Founder B (${fB}): ${splitB}% Shareholding

2. RESPONSIBILITIES & DESIGNATION:
   • Founder A shall assume the role of Chief Executive Officer (CEO).
   • Founder B shall assume the role of Chief Operating Officer (COO).

3. VESTING SCHEDULE:
   ${vesting}

4. JURISDICTION & DISPUTE RESOLUTION:
   This agreement shall be governed under the laws of India. Disputes shall be resolved through arbitration.

IN WITNESS WHEREOF, the Founders have executed this agreement:

____________________________            ____________________________
Founder A Signature                     Founder B Signature`;
    }

    case "board-resolution": {
      const companyName = getVal("companyName", "Company Name");
      const cin = getVal("companyCin", "Corporate Identification Number (CIN)");
      const address = getVal("premisesAddress", "Registered Office Address");
      const meetingDate = getVal("meetingDate", "Meeting Date");
      const meetingTime = getVal("meetingTime", "Meeting Time");
      const location = getVal("meetingLocation", "Meeting Location");
      const resType = getVal("resolutionType", "Resolution Type");
      const subject = getVal("resolutionSubject", "Resolution Subject Description");
      const authPerson = getVal("authorizedPerson", "Authorized Person Name");
      const directors = getVal("directorNames", "Director Names");
      const chairperson = getVal("chairpersonName", "Chairperson Name");

      return `BOARD RESOLUTION
M/S ${companyName}
CIN: ${cin}
Registered Office: ${address}

CERTIFIED TRUE COPY OF THE RESOLUTION PASSED IN THE MEETING OF THE BOARD OF DIRECTORS OF THE COMPANY HELD ON ${meetingDate} AT ${meetingTime} AT ${location}.

RESOLVED THAT the Board hereby approves the following matters:
"${subject}"

RESOLVED FURTHER THAT ${authPerson}, Director/Representative of the Company, be and is hereby authorized to sign, execute, and file necessary declarations, applications, and documents with the Registrar of Companies (ROC) and statutory authorities, and to do all such acts, deeds, and things as may be necessary to give effect to this resolution.

For ${companyName}

____________________________            ____________________________
${chairperson}                          ${directors.split(",")[0] || "Director"}
Chairperson of Meeting                  Director`;
    }

    case "nda": {
      const partyA = getVal("disclosingParty", "Disclosing Party Name");
      const partyB = getVal("receivingParty", "Receiving Party Name");
      const purpose = getVal("purposeOfDisclosure", "Purpose of Disclosure");
      const confDesc = getVal("confidentialDescription", "Confidential Information Description");
      const effectiveDate = getVal("effectiveDate", "Effective Date");
      const term = getVal("period", "Confidentiality Term");
      const govLaw = getVal("governingLaw", "Governing Law State");
      const jurisdiction = getVal("jurisdiction", "Jurisdiction City");
      const ndaType = getVal("ndaType", "NDA Structure Type");

      return `NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT

This Confidentiality Agreement (the "Agreement") is entered into on ${effectiveDate} by and between:
1. ${partyA} ("Disclosing Party"), and
2. ${partyB} ("Receiving Party").

WHEREAS the parties wish to disclose certain proprietary business information for the purpose of: ${purpose}.

NOW, THEREFORE, IT IS AGREED AS FOLLOWS:

1. CONFIDENTIAL INFORMATION:
   Confidential Information includes all proprietary, technical, and commercial data disclosed by the Disclosing Party, including but not limited to: ${confDesc}.

2. STANDARD OF CARE:
   The Receiving Party shall maintain the Confidential Information in strict confidence and shall not disclose it to any third party. The Receiving Party shall protect it with the same degree of care it uses to protect its own similar information.

3. TERM AND PERIOD:
   This Agreement and the duty of confidentiality shall remain in effect for a period of ${term} from the Effective Date.

4. GOVERNING LAW & JURISDICTION:
   This Agreement shall be governed by the laws of ${govLaw}. Any disputes shall be subject to the exclusive jurisdiction of the courts in ${jurisdiction}.

IN WITNESS WHEREOF, the parties hereto have executed this ${ndaType} on the date first written above.

____________________________            ____________________________
Disclosing Party Signature              Receiving Party Signature`;
    }

    case "employment-offer": {
      const company = getVal("companyName", "Company Name");
      const candidate = getVal("candidateName", "Candidate Name");
      const designation = getVal("designation", "Designation Offered");
      const dept = getVal("department", "Department");
      const joinDate = getVal("joiningDate", "Joining Date");
      const location = getVal("workLocation", "Work Location Office");
      const empType = getVal("employmentType", "Employment Type");
      const probation = getVal("probation", "Probation Period");
      const salary = getVal("salary", "Salary Offered");
      const manager = getVal("reportingManager", "Reporting Manager");
      const notice = getVal("noticePeriod", "Notice Period");
      const benefits = fields["benefits"] || "Standard statutory leaves and benefits.";
      const validity = getVal("offerValidity", "Offer Validity Expiration Date");

      return `EMPLOYMENT OFFER LETTER

Date: ${new Date().toLocaleDateString("en-IN")}
To,
${candidate}
Address: [CANDIDATE CURRENT ADDRESS]

Dear ${candidate},

We are pleased to offer you employment with ${company} on the following terms:

1. POSITION:
   You will be appointed to the position of ${designation} in the ${dept} department. You will report to ${manager}.

2. TERM & LOCATION:
   Your employment will commence on ${joinDate}. Your primary location of work will be ${location}. This is a ${empType} position.

3. COMPENSATION:
   Your Gross Annual Salary (CTC) will be INR ${Number(salary).toLocaleString("en-IN")}, subject to applicable tax deductions.

4. PROBATION & NOTICE PERIOD:
   You will be on probation for a period of ${probation}. During this period or thereafter, the notice period required for termination is ${notice}.

5. VALIDITY OF OFFER:
   Please sign and return the duplicate copy of this letter by ${validity}, failing which this offer will stand withdrawn.

Sincerely,

For ${company}

____________________________
Authorized Signatory

ACKNOWLEDGEMENT & ACCEPTANCE
I hereby accept the employment offer on the terms and conditions outlined above.

____________________________
(${candidate})`;
    }

    case "service-agreement": {
      const provider = getVal("providerName", "Service Provider Name");
      const client = getVal("clientName", "Client Name");
      const scope = getVal("scope", "Detailed Scope of Services");
      const start = getVal("joiningDate", "Start Date");
      const end = fields["endDate"] ? getVal("endDate", "End Date") : "termination of agreement";
      const fee = getVal("salary", "Service Fee Amount");
      const payTerms = getVal("paymentTerms", "Payment Schedule");
      const deliverables = getVal("deliverables", "Milestone Deliverables");
      const notice = getVal("noticePeriod", "Notice Period");
      const law = getVal("governingLaw", "Governing Law");
      const city = getVal("jurisdiction", "Jurisdiction City");

      return `SERVICE PROVIDER CONTRACT AGREEMENT

This Service Agreement is entered into on ${start} by and between:
1. ${provider} ("Service Provider"), and
2. ${client} ("Client").

WHEREAS Client desires to retain Service Provider to perform professional services, and Service Provider agrees to perform the same.

NOW, THEREFORE, IT IS MUTUALLY AGREED:

1. SCOPE OF SERVICES & DELIVERABLES:
   Service Provider shall perform the following services: ${scope}.
   The final deliverables shall include: ${deliverables}.

2. FEES AND PAYMENTS:
   Client shall pay Service Provider a fee of INR ${Number(fee).toLocaleString("en-IN")} according to the following schedule: ${payTerms}.

3. TERM AND TERMINATION:
   This Agreement shall remain in effect from ${start} until ${end}. Either party may terminate this Agreement by providing ${notice} prior written notice.

4. JURISDICTION & GOVERNING LAW:
   This Agreement shall be governed by the laws of ${law}. Any disputes arising under this agreement shall be submitted to the courts of ${city}.

IN WITNESS WHEREOF, the parties have signed this Agreement.

____________________________            ____________________________
Service Provider Signature              Client Representative Signature`;
    }

    case "rent-agreement": {
      const landlord = getVal("ownerName", "Landlord Name");
      const tenant = getVal("applicantName", "Tenant Name");
      const address = getVal("premisesAddress", "Full Leased Property Address");
      const rent = getVal("monthlyRent", "Monthly Rent Amount");
      const deposit = getVal("deposit", "Security Deposit Amount");
      const start = getVal("joiningDate", "Lease Start Date");
      const term = getVal("leaseTerm", "Lease Term Duration");
      const dueDay = getVal("rentDueDay", "Rent Due Date");
      const maintenance = getVal("maintenance", "Maintenance Charges");
      const lockin = getVal("lockin", "Lock-in Period");
      const notice = getVal("noticePeriod", "Notice Period");
      const use = getVal("permittedUse", "Permitted Use");
      const city = getVal("jurisdiction", "Governing Jurisdiction");

      return `LEASE DEED & RENT AGREEMENT

This Rent Agreement is made and executed on ${start} by and between:
1. ${landlord} ("Landlord"), and
2. ${tenant} ("Tenant").

WHEREAS Landlord is the absolute owner of the premises: ${address}.

IT IS AGREED BY AND BETWEEN BOTH PARTIES:

1. LEASE TERM & COMMENCEMENT:
   This lease is granted for a total period of ${term} commencing from ${start}.

2. RENT AND DEPOSIT:
   The monthly rent shall be INR ${Number(rent).toLocaleString("en-IN")}, payable on or before the ${dueDay} day of each calendar month. The Tenant has deposited a refundable Security Deposit of INR ${Number(deposit).toLocaleString("en-IN")}.

3. USER PREMISES:
   The premises shall be used only for ${use}. The maintenance fees are: ${maintenance}.

4. LOCK-IN & NOTICE PERIOD:
   The lock-in period shall be ${lockin}. After expiration, either party may terminate the lease by giving a notice of ${notice} to the other party.

5. ARBITRATION:
   Any disputes shall be resolved through arbitration under local laws in the city of ${city}.

IN WITNESS WHEREOF, both parties have signed this lease agreement.

____________________________            ____________________________
Landlord (Owner)                        Tenant (Lessee)`;
    }

    case "legal-notice": {
      const sender = getVal("applicantName", "Sender Name");
      const senderAddr = getVal("premisesAddress", "Sender Full Address");
      const recipient = getVal("ownerName", "Recipient Name");
      const recipientAddr = getVal("propertyDescription", "Recipient Address");
      const subject = getVal("proposedName", "Notice Subject");
      const background = getVal("factualBackground", "Factual Background");
      const breach = getVal("breachCause", "Nature of Breach");
      const claim = fields["salary"] ? `INR ${Number(fields["salary"]).toLocaleString("en-IN")}` : "unspecified damages";
      const deadline = getVal("complianceDeadline", "Compliance Period");
      const advocate = getVal("advocateName", "Advocate Name");

      return `ADVOCATE LEGAL NOTICE OF DEMAND

Date: ${docDate}
Place: ${docPlace}

To,
${recipient}
Address: ${recipientAddr}

SUBJECT: LEGAL NOTICE FOR ${subject.toUpperCase()}

Dear Sir/Madam,

Under instructions from my client, ${sender}, residing at ${senderAddr}, I hereby serve you with this Legal Notice of Demand:

1. My client and you entered into a transaction where ${background}.

2. However, you have committed a direct breach of contract by ${breach}.

3. Consequently, you are liable to pay my client an outstanding sum of ${claim} along with interest.

4. Therefore, I hereby call upon you to comply with these demands within a period of ${deadline} from receipt of this notice, failing which my client has given me strict instructions to initiate legal proceedings under civil and criminal laws.

Yours faithfully,

____________________________
(${advocate})
Advocate & Legal Representative`;
    }

    default: {
      // GENERAL / FALLBACK AGREEMENT GENERATION
      const p1 = getVal("firstParty", "First Party Name");
      const p2 = getVal("secondParty", "Second Party Name");
      const company = fields["companyName"] ? ` (for the proposed company "${fields["companyName"]}")` : "";
      const effectiveDate = getVal("effectiveDate", "Effective Date");
      const law = getVal("governingLaw", "Governing Law State");
      const place = getVal("docPlace", "Execution Place");
      const purpose = fields["detailedPurpose"] ? fields["detailedPurpose"] : "to coordinate corporate responsibilities, business relationships, and operations.";

      return `${template.title.toUpperCase()}

THIS DEED of ${template.title} is made and executed on this ${effectiveDate} at ${place} by and between:

1. ${p1} (hereinafter referred to as the "First Party"), and
2. ${p2} (hereinafter referred to as the "Second Party").

WHEREAS the parties wish to enter into this arrangement${company} for the purpose of:
${purpose}

NOW, THEREFORE, IT IS AGREED AS FOLLOWS:

1. OBJECTIVE & UNDERSTANDING:
   Both parties agree to perform their respective duties and coordinate in good faith as per the terms and guidelines outlined under this ${template.title}.

2. CONFIDENTIALITY:
   Neither party shall disclose any confidential business information, proprietary data, or startup trade secrets shared during this collaboration to any third party.

3. GOVERNING LAW & ARBITRATION:
   This Agreement shall be governed, construed, and enforced in accordance with the laws of ${law}. Any disputes arising under this agreement shall be settled through friendly consultation or arbitration.

IN WITNESS WHEREOF, the parties hereto have set their hands on this document.

____________________________            ____________________________
First Party Signature                   Second Party Signature`;
    }
  }
}
