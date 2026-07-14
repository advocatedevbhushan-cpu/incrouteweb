import React, { useEffect, useState } from "react";
import { Box, Package, Plus, Search, Wrench } from "lucide-react";
import { booksApi, inr } from "../api";
import type { BooksItem, BooksOrganisation } from "../types";
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader } from "./Common";

interface Unit { id: string; code: string; name: string }
interface TaxRate { id: string; name: string; rate: string }
const emptyForm = { type: "SERVICE", name: "", sku: "", hsnSac: "", unitId: "", taxRateId: "", sellingPrice: "0.00", purchasePrice: "0.00", openingStock: "0.000", reorderPoint: "" };

export default function ItemsPage({ organisation }:{ organisation: BooksOrganisation }) {
  const [items, setItems] = useState<BooksItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { const data = await booksApi<{ items: BooksItem[]; units: Unit[]; taxRates: TaxRate[] }>(`/items?organisationId=${encodeURIComponent(organisation.id)}`); setItems(data.items); setUnits(data.units); setTaxRates(data.taxRates); setForm((current) => ({ ...current, unitId: current.unitId || data.units[0]?.id || "", taxRateId: current.taxRateId || data.taxRates.find((rate) => Number(rate.rate) === 18)?.id || "" })); }
    catch (cause: any) { setError(cause.message || "Unable to load items"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [organisation.id]);
  const filtered = items.filter((item) => [item.name, item.sku, item.hsnSac].some((value) => value?.toLowerCase().includes(search.toLowerCase())));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFormError("");
    try { await booksApi("/items", { method: "POST", body: JSON.stringify({ organisationId: organisation.id, ...form, taxRateId: form.taxRateId || null, reorderPoint: form.reorderPoint || null }) }); setShowForm(false); setForm({ ...emptyForm, unitId: units[0]?.id || "", taxRateId: taxRates.find((rate) => Number(rate.rate) === 18)?.id || "" }); await load(); }
    catch (cause: any) { setFormError(cause.message || "Unable to save item"); }
    finally { setSaving(false); }
  };
  if (loading) return <LoadingState label="Loading goods and services" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div className="books-page">
    <PageHeader eyebrow="Masters" title="Items & services" description="HSN/SAC, GST rates, pricing and stock controls for invoice and bill lines." action={<button className="books-primary" onClick={() => setShowForm(true)}><Plus />New item</button>} />
    <section className="books-panel books-table-panel"><div className="books-table-toolbar"><div className="books-inline-search"><Search /><input aria-label="Search items" placeholder="Search item, SKU or HSN/SAC" value={search} onChange={(event) => setSearch(event.target.value)} /></div><span>{filtered.length} records</span></div>
      {filtered.length ? <div className="books-table-wrap"><table className="books-table"><thead><tr><th>Item</th><th>Classification</th><th>Unit</th><th>GST</th><th className="num">Sale price</th><th className="num">Opening stock</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="books-name-cell"><span>{item.type === "GOODS" ? <Package /> : <Wrench />}</span><div><strong>{item.name}</strong><small>{item.sku || item.type}</small></div></div></td><td><strong className="books-mono">{item.hsnSac}</strong><small className="books-cell-sub">{item.type === "GOODS" ? "HSN" : "SAC"}</small></td><td>{item.unitCode}</td><td>{item.taxName || "No tax"}</td><td className="num"><strong>{inr(item.sellingPrice)}</strong></td><td className="num">{Number(item.openingStock).toLocaleString("en-IN")} {item.unitCode}</td></tr>)}</tbody></table></div> : <EmptyState icon={Box} title="No items or services yet" description="Add a billable service or a stock item with its correct HSN/SAC and GST rate." action={<button className="books-primary" onClick={() => setShowForm(true)}><Plus />Add first item</button>} />}
    </section>
    {showForm && <Modal title="Add item or service" description="The GST classification is copied into transaction lines." onClose={() => setShowForm(false)}><form className="books-modal-form" onSubmit={save}><div className="books-form-grid">
      <label><span>Type *</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="SERVICE">Service</option><option value="GOODS">Goods</option></select></label>
      <label><span>Name *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label><span>SKU</span><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
      <label><span>{form.type === "GOODS" ? "HSN" : "SAC"} code *</span><input required minLength={4} maxLength={8} value={form.hsnSac} onChange={(e) => setForm({ ...form, hsnSac: e.target.value.replace(/\D/g, "") })} /></label>
      <label><span>Unit *</span><select required value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name} ({unit.code})</option>)}</select></label>
      <label><span>GST rate</span><select value={form.taxRateId} onChange={(e) => setForm({ ...form, taxRateId: e.target.value })}><option value="">No tax</option>{taxRates.map((tax) => <option key={tax.id} value={tax.id}>{tax.name}</option>)}</select></label>
      <label><span>Selling price</span><input inputMode="decimal" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></label>
      <label><span>Purchase price</span><input inputMode="decimal" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} /></label>
      {form.type === "GOODS" && <><label><span>Opening stock</span><input inputMode="decimal" value={form.openingStock} onChange={(e) => setForm({ ...form, openingStock: e.target.value })} /></label><label><span>Reorder point</span><input inputMode="decimal" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} /></label></>}
    </div>{formError && <p className="books-form-error">{formError}</p>}<footer><button type="button" className="books-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="books-primary" disabled={saving || !form.name || !form.hsnSac || !form.unitId}>{saving ? "Saving…" : "Save item"}</button></footer></form></Modal>}
  </div>;
}

