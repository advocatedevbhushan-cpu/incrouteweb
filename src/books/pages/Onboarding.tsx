import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, Landmark, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { booksApi } from "../api";
import type { BooksOrganisation, ExistingEntity } from "../types";

const typeMap: Record<string, string> = {
  PVT_LTD: "PRIVATE_LIMITED", PRIVATE_LIMITED: "PRIVATE_LIMITED", PUBLIC_LTD: "PUBLIC_LIMITED", LLP: "LLP", OPC: "OPC",
  PARTNERSHIP: "PARTNERSHIP", PROPRIETORSHIP: "PROPRIETORSHIP", SECTION_8: "SECTION_8",
};

export default function Onboarding({ entities, adminMode = false, onCreated, onExit }:{ entities: ExistingEntity[]; adminMode?: boolean; onCreated: (organisation: BooksOrganisation) => void; onExit: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    legalName: "", tradeName: "", entityType: "PRIVATE_LIMITED", pan: "", tan: "", cinLlpIn: "", gstin: "", stateCode: "",
    reportingMethod: "ACCRUAL", invoicePrefix: "INV", line1: "", line2: "", city: "", state: "", postalCode: "",
  });

  const selected = useMemo(() => entities.find((entity) => entity.id === selectedEntity), [entities, selectedEntity]);
  const selectEntity = (id: string) => {
    setSelectedEntity(id);
    const entity = entities.find((item) => item.id === id);
    if (entity) setForm((current) => ({ ...current, legalName: entity.name, entityType: typeMap[entity.type] || "OTHER", pan: entity.pan || "", cinLlpIn: entity.cin || "", gstin: entity.gstin || "", stateCode: entity.gstin?.slice(0, 2) || current.stateCode }));
  };

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const data = await booksApi<{ organisation: BooksOrganisation }>("/organisations", {
        method: "POST",
        body: JSON.stringify({
          ownershipScope: adminMode && !selectedEntity ? "ADMIN_FIRM" : selectedEntity ? "CLIENT_ENTITY" : "OWN_ORGANISATION",
          sourceEntityId: selectedEntity || null, legalName: form.legalName, tradeName: form.tradeName || null, entityType: form.entityType,
          pan: form.pan, tan: form.tan, cinLlpIn: form.cinLlpIn, gstin: form.gstin, stateCode: form.stateCode,
          reportingMethod: form.reportingMethod, financialYearStartMonth: 4, invoicePrefix: form.invoicePrefix,
          registeredAddress: form.line1 ? { line1: form.line1, line2: form.line2 || undefined, city: form.city, state: form.state, postalCode: form.postalCode } : null,
        }),
      });
      onCreated({ ...data.organisation, entityType: form.entityType, baseCurrency: "INR", reportingMethod: form.reportingMethod as "ACCRUAL" | "CASH", roleCode: "ORGANISATION_OWNER", gstin: form.gstin || null, fiscalYear: data.organisation.fiscalYear });
    } catch (cause: any) { setError(cause.message || "Organisation setup failed"); }
    finally { setSaving(false); }
  };

  return <div className="books-onboarding">
    <header><button onClick={onExit}><ArrowLeft />{adminMode ? "Admin portal" : "INCroute portal"}</button><div className="books-onboarding-brand"><img src="/incroute_logo.png" alt="INCroute" /><div><strong>INCroute Books</strong><span>Accounts, compliance and corporate records—under one roof.</span></div></div><span className="books-secure"><ShieldCheck />Private & tenant-isolated</span></header>
    <div className="books-onboarding-progress"><i className={step >= 1 ? "done" : ""}>1</i><span className={step >= 2 ? "done" : ""} /><i className={step >= 2 ? "done" : ""}>2</i><span className={step >= 3 ? "done" : ""} /><i className={step >= 3 ? "done" : ""}>3</i></div>
    <main>
      {step === 1 && <section className="books-onboarding-card">
        <span className="books-onboarding-icon"><Building2 /></span><p className="books-kicker">Step 1 of 3</p><h1>{adminMode ? "Set up your accounting firm" : "Choose your accounting organisation"}</h1><p>{adminMode ? "Create a standalone firm for your own books, or connect an existing client entity when one is available." : "Connect an existing INCroute entity or start a separate accounting organisation."}</p>
        {entities.length > 0 && <div className="books-entity-list">{entities.map((entity) => <button key={entity.id} className={selectedEntity === entity.id ? "selected" : ""} onClick={() => selectEntity(entity.id)}><span><Building2 /></span><div><strong>{entity.name}</strong><small>{entity.type.replaceAll("_", " ")} {entity.gstin ? `· GSTIN ${entity.gstin}` : "· GST not configured"}</small></div>{selectedEntity === entity.id && <Check />}</button>)}</div>}
        <button className={`books-new-org ${selectedEntity === "" ? "selected" : ""}`} onClick={() => { setSelectedEntity(""); setForm((current) => ({ ...current, legalName: "", pan: "", cinLlpIn: "", gstin: "" })); }}><span><Sparkles /></span><div><strong>{adminMode ? "Create my own firm" : "Create a new accounting organisation"}</strong><small>{adminMode ? "Standalone accounting for your practice; no Client record is required" : "For a business not yet listed in My Entities"}</small></div>{selectedEntity === "" && <Check />}</button>
        <footer><span /><button className="books-primary" onClick={() => setStep(2)}>Continue<ArrowRight /></button></footer>
      </section>}

      {step === 2 && <section className="books-onboarding-card books-onboarding-form">
        <span className="books-onboarding-icon"><Landmark /></span><p className="books-kicker">Step 2 of 3</p><h1>Legal and tax identity</h1><p>These details appear on invoices, reports and GST working papers.</p>
        <div className="books-form-grid">
          <label className="span-2"><span>Legal name *</span><input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} /></label>
          <label><span>Trade name</span><input value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} /></label>
          <label><span>Entity type *</span><select value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value })}>{["PRIVATE_LIMITED","PUBLIC_LIMITED","LLP","OPC","PARTNERSHIP","PROPRIETORSHIP","SECTION_8","OTHER"].map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label><span>PAN</span><input maxLength={10} value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} /></label>
          <label><span>TAN</span><input maxLength={10} value={form.tan} onChange={(e) => setForm({ ...form, tan: e.target.value.toUpperCase() })} /></label>
          <label><span>CIN / LLPIN</span><input value={form.cinLlpIn} onChange={(e) => setForm({ ...form, cinLlpIn: e.target.value.toUpperCase() })} /></label>
          <label><span>GSTIN</span><input maxLength={15} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase(), stateCode: e.target.value.slice(0, 2) })} /></label>
          <label><span>State code</span><input maxLength={2} value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value.replace(/\D/g, "") })} /></label>
          <label><span>Accounting method</span><select value={form.reportingMethod} onChange={(e) => setForm({ ...form, reportingMethod: e.target.value })}><option value="ACCRUAL">Accrual</option><option value="CASH">Cash</option></select></label>
        </div>
        <footer><button className="books-secondary" onClick={() => setStep(1)}><ArrowLeft />Back</button><button className="books-primary" disabled={!form.legalName} onClick={() => setStep(3)}>Continue<ArrowRight /></button></footer>
      </section>}

      {step === 3 && <section className="books-onboarding-card books-onboarding-form">
        <span className="books-onboarding-icon"><Building2 /></span><p className="books-kicker">Step 3 of 3</p><h1>Registered office and numbering</h1><p>You can complete optional address details later in Settings.</p>
        <div className="books-form-grid">
          <label className="span-2"><span>Address line 1</span><input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></label>
          <label className="span-2"><span>Address line 2</span><input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></label>
          <label><span>City</span><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label><span>State</span><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
          <label><span>PIN code</span><input maxLength={6} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, "") })} /></label>
          <label><span>Invoice prefix</span><input maxLength={20} value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9/-]/g, "") })} /></label>
        </div>
        {selected && <div className="books-linked-note"><Check />Linked to {selected.name} in My Entities</div>}
        {error && <p className="books-form-error">{error}</p>}
        <footer><button className="books-secondary" onClick={() => setStep(2)}><ArrowLeft />Back</button><button className="books-primary" onClick={submit} disabled={saving || !form.legalName || (!!form.line1 && (!form.city || !form.state || form.postalCode.length !== 6))}>{saving ? <><Loader2 className="books-spin" />Preparing books</> : <>Create organisation<ArrowRight /></>}</button></footer>
      </section>}
    </main>
    <p className="books-no-demo">No demo transactions are added. Your Books workspace starts with only statutory masters and a standard Indian chart of accounts.</p>
  </div>;
}
