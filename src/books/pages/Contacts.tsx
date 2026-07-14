import React, { useEffect, useState } from "react";
import { Building2, Mail, Phone, Plus, Search, Users } from "lucide-react";
import { booksApi, inr } from "../api";
import type { BooksContact, BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader } from "./Common";

const emptyForm = { displayName: "", legalName: "", email: "", phone: "", gstin: "", pan: "", placeOfSupply: "", paymentTermsDays: 0, openingBalance: "0.00", notes: "" };

export default function ContactsPage({ organisation, type }:{ organisation: BooksOrganisation; type: "CUSTOMER" | "VENDOR" }) {
  const [contacts, setContacts] = useState<BooksContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const noun = type === "CUSTOMER" ? "customer" : "vendor";

  const load = async () => {
    setLoading(true); setError("");
    try { const data = await booksApi<{ contacts: BooksContact[] }>(`/contacts?organisationId=${encodeURIComponent(organisation.id)}&type=${type}`); setContacts(data.contacts); }
    catch (cause: any) { setError(cause.message || `Unable to load ${noun}s`); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [organisation.id, type]);
  const filtered = contacts.filter((contact) => [contact.displayName, contact.legalName, contact.gstin, contact.email].some((value) => value?.toLowerCase().includes(search.toLowerCase())));

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFormError("");
    try {
      await booksApi("/contacts", { method: "POST", body: JSON.stringify({ organisationId: organisation.id, type, ...form, paymentTermsDays: Number(form.paymentTermsDays) }) });
      setShowForm(false); setForm(emptyForm); await load();
    } catch (cause: any) { setFormError(cause.message || `Unable to save ${noun}`); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState label={`Loading ${noun}s`} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div className="books-page">
    <PageHeader eyebrow={type === "CUSTOMER" ? "Sales master" : "Purchase master"} title={type === "CUSTOMER" ? "Customers" : "Vendors"} description={`GST identity, balances, payment terms and contact details for every ${noun}.`} action={<button className="books-primary" onClick={() => setShowForm(true)}><Plus />Add {noun}</button>} />
    <section className="books-panel books-table-panel">
      <div className="books-table-toolbar"><div className="books-inline-search"><Search /><input aria-label={`Search ${noun}s`} placeholder={`Search ${noun}s, GSTIN or email`} value={search} onChange={(event) => setSearch(event.target.value)} /></div><span>{filtered.length} {filtered.length === 1 ? noun : `${noun}s`}</span></div>
      {filtered.length ? <div className="books-table-wrap"><table className="books-table"><thead><tr><th>Name</th><th>Contact</th><th>GST identity</th><th>Terms</th><th className="num">Opening balance</th></tr></thead><tbody>{filtered.map((contact) => <tr key={contact.id}><td><div className="books-name-cell"><span>{type === "CUSTOMER" ? <Users /> : <Building2 />}</span><div><strong>{contact.displayName}</strong><small>{contact.legalName || contact.type}</small></div></div></td><td><div className="books-contact-cell">{contact.email && <span><Mail />{contact.email}</span>}{contact.phone && <span><Phone />{contact.phone}</span>}{!contact.email && !contact.phone && <small>Not provided</small>}</div></td><td><strong className="books-mono">{contact.gstin || "Unregistered"}</strong><small className="books-cell-sub">{contact.pan || "PAN not set"}</small></td><td>{contact.paymentTermsDays ? `${contact.paymentTermsDays} days` : "Due on receipt"}</td><td className="num"><strong>{inr(contact.openingBalance)}</strong></td></tr>)}</tbody></table></div> : <EmptyState icon={type === "CUSTOMER" ? Users : Building2} title={`No ${noun}s found`} description={search ? "Try a different search." : `Add your first ${noun} to begin recording ${type === "CUSTOMER" ? "sales" : "purchases"}.`} action={!search ? <button className="books-primary" onClick={() => setShowForm(true)}><Plus />Add {noun}</button> : undefined} />}
    </section>
    {showForm && <Modal title={`Add ${noun}`} description="Only fields needed for this relationship are required." onClose={() => setShowForm(false)}><form className="books-modal-form" onSubmit={save}><div className="books-form-grid">
      <label><span>Display name *</span><input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></label>
      <label><span>Legal name</span><input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} /></label>
      <label><span>Email</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label><span>GSTIN</span><input maxLength={15} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase(), placeOfSupply: e.target.value.slice(0,2) })} /></label>
      <label><span>PAN</span><input maxLength={10} value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} /></label>
      <label><span>Place of supply code</span><input maxLength={2} value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value.replace(/\D/g, "") })} /></label>
      <label><span>Payment terms (days)</span><input type="number" min="0" max="365" value={form.paymentTermsDays} onChange={(e) => setForm({ ...form, paymentTermsDays: Number(e.target.value) })} /></label>
      <label><span>Opening balance</span><input inputMode="decimal" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} /></label>
      <label className="span-2"><span>Notes</span><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
    </div>{formError && <p className="books-form-error">{formError}</p>}<footer><button type="button" className="books-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="books-primary" disabled={saving || !form.displayName}>{saving ? "Saving…" : `Save ${noun}`}</button></footer></form></Modal>}
  </div>;
}

