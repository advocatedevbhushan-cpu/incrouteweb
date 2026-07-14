import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PortalShell from "./PortalShell";
import BooksApp from "../books/BooksApp";
import Dashboard from "./screens/Dashboard";
import Entities from "./screens/Entities";
import Compliance from "./screens/Compliance";
import Documents from "./screens/Documents";
import { Legal, Trademark, TaxGST, Consultations, Invoices, Support, Notifications, ProfileSettings } from "./screens/PlaceholderScreens";

export default function ClientPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeScreen, setActiveScreenState] = useState(() => location.pathname.startsWith("/portal/books") ? "books" : "dashboard");

  React.useEffect(() => {
    if (location.pathname.startsWith("/portal/books")) setActiveScreenState("books");
  }, [location.pathname]);

  const setActiveScreen = (screen: string) => {
    setActiveScreenState(screen);
    if (screen === "books") navigate("/portal/books/dashboard");
    else if (location.pathname.startsWith("/portal/books")) navigate("/portal");
  };

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

  if (activeScreen === "books") {
    return <BooksApp onExit={(screen = "dashboard") => setActiveScreen(screen)} />;
  }

  return (
    <PortalShell activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {renderScreen()}
    </PortalShell>
  );
}
