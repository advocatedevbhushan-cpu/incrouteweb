import React, { useState } from "react";
import PortalShell from "./PortalShell";
import Dashboard from "./screens/Dashboard";
import Entities from "./screens/Entities";
import Compliance from "./screens/Compliance";
import Documents from "./screens/Documents";
import { Legal, Trademark, TaxGST, Consultations, Invoices, Support, Notifications, ProfileSettings } from "./screens/PlaceholderScreens";

export default function ClientPortal() {
  const [activeScreen, setActiveScreen] = useState("dashboard");

  // Expose navigation to child screens via window for metric card clicks
  React.useEffect(() => {
    (window as any).__portalNav = setActiveScreen;
    return () => { delete (window as any).__portalNav; };
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard": return <Dashboard />;
      case "entities": return <Entities />;
      case "compliance": return <Compliance />;
      case "documents": return <Documents />;
      case "legal": return <Legal />;
      case "trademark": return <Trademark />;
      case "tax": return <TaxGST />;
      case "consultations": return <Consultations />;
      case "invoices": return <Invoices />;
      case "support": return <Support />;
      case "notifications": return <Notifications />;
      case "settings": return <ProfileSettings />;
      default: return <Dashboard />;
    }
  };

  return (
    <PortalShell activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {renderScreen()}
    </PortalShell>
  );
}
