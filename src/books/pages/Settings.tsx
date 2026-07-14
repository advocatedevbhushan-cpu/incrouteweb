import React, { useEffect, useState } from "react";
import { CalendarRange, CheckCircle2, LockKeyhole, Settings } from "lucide-react";
import { booksApi, indianDate } from "../api";
import type { BooksOrganisation } from "../types";
import { ErrorState, LoadingState, Modal, PageHeader, Status } from "./Common";

interface Period { id:string;name:string;startsOn:string;endsOn:string;status:string;lockedAt?:string|null;lockedBy?:string|null }

export default function SettingsPage({organisation}:{organisation:BooksOrganisation}){
  const[periods,setPeriods]=useState<Period[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState("");const[target,setTarget]=useState<Period|null>(null);const[saving,setSaving]=useState(false);const[formError,setFormError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{const data=await booksApi<{periods:Period[]}>(`/periods?organisationId=${organisation.id}`);setPeriods(data.periods);}catch(cause:any){setError(cause.message||"Unable to load accounting periods");}finally{setLoading(false);}};
  useEffect(()=>{load();},[organisation.id]);
  const lock=async()=>{if(!target)return;setSaving(true);setFormError("");try{await booksApi(`/periods/${target.id}/lock`,{method:"POST",body:JSON.stringify({organisationId:organisation.id})});setTarget(null);await load();}catch(cause:any){setFormError(cause.message||"Unable to lock period");}finally{setSaving(false);}};
  if(loading)return <LoadingState label="Loading Books settings"/>;if(error)return <ErrorState message={error} onRetry={load}/>;
  return <div className="books-page"><PageHeader eyebrow="Configuration" title="Books settings" description="Organisation identity, financial year, accounting method and controlled period close."/>
    <div className="books-settings-summary"><div><span><Settings/></span><div><small>Accounting method</small><strong>{organisation.reportingMethod}</strong></div></div><div><span><CalendarRange/></span><div><small>Current financial year</small><strong>{organisation.fiscalYear||"Not configured"}</strong></div></div><div><span><LockKeyhole/></span><div><small>Locked periods</small><strong>{periods.filter((p)=>p.status==="LOCKED").length} of {periods.length}</strong></div></div></div>
    <section className="books-panel books-table-panel"><div className="books-table-toolbar"><div><strong className="books-toolbar-title">Accounting periods</strong><small className="books-cell-sub">Locked periods reject invoices, bills, payments and journals dated inside them.</small></div><span>{periods.length} monthly periods</span></div><div className="books-table-wrap"><table className="books-table"><thead><tr><th>Period</th><th>Starts</th><th>Ends</th><th>Status</th><th>Closed at</th><th>Action</th></tr></thead><tbody>{periods.map((period)=><tr key={period.id}><td><strong>{period.name}</strong></td><td>{indianDate(period.startsOn)}</td><td>{indianDate(period.endsOn)}</td><td><Status value={period.status}/></td><td>{period.lockedAt?indianDate(period.lockedAt):"—"}</td><td>{period.status!=="LOCKED"?<button className="books-table-action" onClick={()=>{setTarget(period);setFormError("");}}><LockKeyhole/>Lock period</button>:<span className="books-locked-label"><CheckCircle2/>Closed</span>}</td></tr>)}</tbody></table></div></section>
    {target&&<Modal title={`Lock ${target.name}?`} description="This action blocks all further postings dated within this period." onClose={()=>setTarget(null)}><div className="books-confirm"><span><LockKeyhole/></span><div><strong>{indianDate(target.startsOn)} to {indianDate(target.endsOn)}</strong><p>Review the trial balance and GST working summary first. Reopening is intentionally not available in this MVP.</p></div></div>{formError&&<p className="books-form-error">{formError}</p>}<footer className="books-modal-footer"><button className="books-secondary" onClick={()=>setTarget(null)}>Cancel</button><button className="books-primary" onClick={lock} disabled={saving}>{saving?"Locking…":"Confirm period lock"}</button></footer></Modal>}
  </div>;
}

