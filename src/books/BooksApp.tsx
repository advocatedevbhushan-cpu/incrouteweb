import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Database, LogOut, RefreshCw } from "lucide-react";
import { booksApi } from "./api";
import BooksShell from "./BooksShell";
import type { BooksBootstrap, BooksOrganisation } from "./types";
import BooksDashboard from "./pages/Dashboard";
import BillsPage from "./pages/Bills";
import ContactsPage from "./pages/Contacts";
import InvoicesPage from "./pages/Invoices";
import ItemsPage from "./pages/Items";
import ModuleStatus from "./pages/ModuleStatus";
import Onboarding from "./pages/Onboarding";
import ReportsPage from "./pages/Reports";
import GstPage from "./pages/Gst";
import SettingsPage from "./pages/Settings";
import { LoadingState } from "./pages/Common";
import "./books.css";

const supportedRoutes = new Set(["dashboard", "sales", "invoices", "customers", "purchases", "bills", "vendors", "items", "banking", "accountant", "gst", "reports", "documents", "settings"]);

export default function BooksApp({ onExit, basePath = "/portal/books" }:{ onExit: (screen?: string) => void; basePath?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const normalizedBasePath = basePath.replace(/\/$/, "");
  const organisationStorageKey = normalizedBasePath.startsWith("/admin/") ? "incroute_books_admin_organisation" : "incroute_books_organisation";
  const [bootstrap, setBootstrap] = useState<BooksBootstrap | null>(null);
  const [activeOrganisationId, setActiveOrganisationId] = useState(() => localStorage.getItem(organisationStorageKey) || "");
  const [creatingOrganisation, setCreatingOrganisation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const route = useMemo(() => {
    const routePath = location.pathname.startsWith(normalizedBasePath)
      ? location.pathname.slice(normalizedBasePath.length)
      : "";
    const segment = routePath.replace(/^\//, "").split("/")[0] || "dashboard";
    return supportedRoutes.has(segment) ? segment : "dashboard";
  }, [location.pathname, normalizedBasePath]);

  const loadBootstrap = async () => {
    setLoading(true); setError(null);
    try {
      const data = await booksApi<BooksBootstrap>("/bootstrap");
      setBootstrap(data);
      const valid = data.organisations.some((organisation) => organisation.id === activeOrganisationId);
      if (!valid && data.organisations[0]) setActiveOrganisationId(data.organisations[0].id);
    } catch (cause: any) { setError({ message: cause.message || "INCroute Books could not be loaded", code: cause.code }); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadBootstrap(); }, []);
  useEffect(() => {
    if (error && (error.message === "Not authenticated" || error.code === "UNAUTHENTICATED")) {
      const currentUrl = window.location.href;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    }
  }, [error]);
  useEffect(() => { if (activeOrganisationId) localStorage.setItem(organisationStorageKey, activeOrganisationId); }, [activeOrganisationId, organisationStorageKey]);
  const organisation = bootstrap?.organisations.find((item) => item.id === activeOrganisationId) || bootstrap?.organisations[0];
  const adminMode = bootstrap?.user.role === "ADMIN" || bootstrap?.user.role === "SUPER_ADMIN";
  const go = (nextRoute: string) => navigate(`${normalizedBasePath}/${nextRoute === "dashboard" ? "dashboard" : nextRoute}`);

  if (loading) return <div className="books-standalone"><LoadingState label="Opening INCroute Books" /></div>;
  if (error) return <div className="books-standalone"><div className="books-setup-state"><span><Database /></span><h1>{error.code === "BOOKS_SCHEMA_REQUIRED" ? "Books is ready for database activation" : "Books is temporarily unavailable"}</h1><p>{error.message}</p>{error.code === "BOOKS_SCHEMA_REQUIRED" && <div><strong>Deployment action required</strong><p>Apply the Books migration and reference seed supplied with this release, then reopen the workspace.</p></div>}<footer><button className="books-secondary" onClick={() => onExit("dashboard")}><LogOut />Return to portal</button><button className="books-primary" onClick={loadBootstrap}><RefreshCw />Try again</button></footer></div></div>;
  if (!bootstrap) return null;
  if (!organisation || creatingOrganisation) return <Onboarding adminMode={adminMode} entities={bootstrap.existingEntities} onExit={() => { if (organisation) setCreatingOrganisation(false); else onExit("dashboard"); }} onCreated={(created) => { const next = { ...created, tradeName: created.tradeName || null }; setBootstrap({ ...bootstrap, organisations: [...bootstrap.organisations, next] }); setActiveOrganisationId(next.id); setCreatingOrganisation(false); navigate(`${normalizedBasePath}/dashboard`); }} />;

  const content = route === "dashboard" ? <BooksDashboard organisation={organisation} onNavigate={go} />
    : route === "customers" ? <ContactsPage organisation={organisation} type="CUSTOMER" />
    : route === "vendors" ? <ContactsPage organisation={organisation} type="VENDOR" />
    : route === "items" ? <ItemsPage organisation={organisation} />
    : route === "invoices" ? <InvoicesPage organisation={organisation} onNavigate={go} />
    : route === "bills" ? <BillsPage organisation={organisation} onNavigate={go} />
    : route === "gst" ? <GstPage organisation={organisation} />
    : route === "reports" ? <ReportsPage organisation={organisation} />
    : route === "settings" ? <SettingsPage organisation={organisation} />
    : <ModuleStatus route={route} organisation={organisation} onNavigate={go} />;

  return <BooksShell route={route} organisations={bootstrap.organisations} organisation={organisation} onNavigate={go} onOrganisation={setActiveOrganisationId} onCreateOrganisation={adminMode ? () => setCreatingOrganisation(true) : undefined} onExit={() => onExit("dashboard")}>{content}</BooksShell>;
}
