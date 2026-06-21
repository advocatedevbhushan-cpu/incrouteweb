import React, { useState } from "react";
import AdminShell from "./AdminShell";
import AdminDashboard from "./screens/AdminDashboard";
import ClientManagement from "./screens/ClientManagement";
import ComplianceOps from "./screens/ComplianceOps";
import TaskManagement from "./screens/TaskManagement";
import DocumentOps from "./screens/DocumentOps";
import InvoiceOps from "./screens/InvoiceOps";
import TeamManagement from "./screens/TeamManagement";
import { TicketOps, ConsultationOps, TrademarkOps, LegalOps, ReportingDashboard, AuditCenter } from "./screens/OpsScreens";

export default function AdminPortal() {
  const [screen, setScreen] = useState("dashboard");

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <AdminDashboard onNavigate={setScreen} />;
      case "clients": return <ClientManagement />;
      case "compliance": return <ComplianceOps />;
      case "tasks": return <TaskManagement />;
      case "documents": return <DocumentOps />;
      case "invoices": return <InvoiceOps />;
      case "team": return <TeamManagement />;
      case "tickets": return <TicketOps />;
      case "consultations": return <ConsultationOps />;
      case "trademarks": return <TrademarkOps />;
      case "legal": return <LegalOps />;
      case "reports": return <ReportingDashboard />;
      case "audit": return <AuditCenter />;
      default: return <AdminDashboard onNavigate={setScreen} />;
    }
  };

  return (
    <AdminShell activeScreen={screen} setActiveScreen={setScreen}>
      {renderScreen()}
    </AdminShell>
  );
}
