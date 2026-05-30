import React, { useState, useEffect, useRef } from "react";
import { auth, googleSignIn, logout } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  Sparkles, 
  ShieldAlert, 
  Upload, 
  User as UserIcon, 
  LogOut, 
  Loader2, 
  Send,
  MessageSquare,
  FileText,
  
} from "lucide-react";
import { FirmOrder, ChecklistItem, ChatMessage } from "../types";

export default function ClientPortal() {
  // Allow either a Firebase `User` or a lightweight local custom session shape
  type CustomUser = { email: string; displayName?: string | null; photoURL?: string | null; providerId?: string };
  const [user, setUser] = useState<User | CustomUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [orders, setOrders] = useState<FirmOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<FirmOrder | null>(null);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  
  // AI Consult State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Track whether the current session was created via the custom email form
  const isCustomSessionRef = useRef(false);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Monitor Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we created a local custom session, ignore Firebase auth events
      if (isCustomSessionRef.current) {
        setLoadingAuth(false);
        return;
      }

      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email) {
          fetchOrders(currentUser.email);
        }
      } else {
        setUser(null);
        setOrders([]);
        setSelectedOrder(null);
      }

      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch orders linked to client's email
  const fetchOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/portal/orders?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        if (data.orders.length > 0) {
          // Auto select first order if none selected
          setSelectedOrder(prev => {
            const stillExists = data.orders.find((o: FirmOrder) => o.id === prev?.id);
            return stillExists || data.orders[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed fetching client filings ledger:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err) {
      console.error("Authentication sign-in error:", err);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    // Mark that this is a local, custom session so the Firebase listener won't override it
    isCustomSessionRef.current = true;
    const customUser: CustomUser = {
      email: cleanEmail,
      displayName: cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1),
      photoURL: null,
      providerId: "custom-email"
    };

    setUser(customUser);
    fetchOrders(customUser.email);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      // Clear custom-session flag as well
      isCustomSessionRef.current = false;
      setUser(null);
      setOrders([]);
      setSelectedOrder(null);
      setChatMessages([]);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Simulate file upload API call
  const handleFileUpload = async (checklistItemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrder) return;

    setUploadingItem(checklistItemId);
    
    // Simulate natural upload latency
    setTimeout(async () => {
      try {
        const payload = {
          orderId: selectedOrder.id,
          checklistItemId,
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        };

        const response = await fetch("/api/portal/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success && data.order) {
          setSelectedOrder(data.order);
          // Sync changes back to the main list
          setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
          
          // Seed automated confirmation message in AI context optionally
          const autoMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `I detected you uploaded the file **"${file.name}"** successfully. I have cataloged this document under your secure filing checklist. Our compliance panel will pre-verify it within 1-2 hours! Let me know if you need to double-check any specific clauses.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, autoMessage]);
        }
      } catch (err) {
        console.error("File submission error:", err);
      } finally {
        setUploadingItem(null);
      }
    }, 1500);
  };

  // Send query to Gemini Legal consultant
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userMsgText = chatInput;
    setChatInput("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLoadingChat(true);

    // Use functional updater to atomically append the user message and then send using that exact history
    setChatMessages(prev => {
      const newMessages = [...prev, userMessage];

      (async () => {
        try {
          const messagesHistory = newMessages.map(m => ({ role: m.role, content: m.content }));

          const response = await fetch("/api/portal/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messagesHistory, selectedOrder })
          });

          const data = await response.json();
          if (data.success && data.reply) {
            const assistantMessage: ChatMessage = {
              id: `msg-${Date.now() + 1}`,
              role: "assistant",
              content: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev2 => [...prev2, assistantMessage]);
          } else {
            throw new Error(data.error || "Failed loading reply.");
          }
        } catch (err: any) {
          const errMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: `⚠️ Consultation Service Alert: The advisor system is syncing. Please check your environment key connection details. Fallback info: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev2 => [...prev2, errMsg]);
        } finally {
          setLoadingChat(false);
        }
      })();

      return newMessages;
    });
  };

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loadingChat]);

  // Stepper Node Definitions
  const getStepperStages = (status: string) => {
    const steps = [
      { id: "draft", label: "Order Placed", desc: "Compliance assignment" },
      { id: "name_approval", label: "Name Cleared", desc: "ROC clearance check" },
      { id: "document_review", label: "Document Review", desc: "Expert verification" },
      { id: "roc_filing", label: "ROC Registrar Filing", desc: "Lodging forms SPICe+" },
      { id: "approved", label: "Incorporated", desc: "COI, PAN, TAN Issued" }
    ];

    const statusIndex = steps.findIndex(s => s.id === status);
    
    return steps.map((step, idx) => {
      let state: "completed" | "active" | "upcoming" = "upcoming";
      if (idx < statusIndex) state = "completed";
      else if (idx === statusIndex) state = "active";
      
      return { ...step, state };
    });
  };

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
        <p className="mt-4 text-xs font-mono text-brand-text-muted uppercase tracking-widest">Encrypting Session Workspace...</p>
      </div>
    );
  }

  // --- VIEW 1: AUTH GATE (Google & Email Sign-In) ---
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden subtle-glow premium-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
          
          <div className="text-center space-y-3 relative z-10">
            <div className="inline-flex p-3 bg-brand-gold/10 rounded-full border border-brand-gold/20 text-brand-gold mb-1">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-light text-brand-text tracking-wide serif">
              Secure <span className="text-brand-gold italic">Client Portal</span>
            </h2>
            <p className="text-xs text-brand-text-muted leading-relaxed font-sans max-w-sm mx-auto">
              Welcome back to Incroute. Log in via your Google credentials or your registered Email ID to securely manage your corporate assets.
            </p>
          </div>

          <div className="space-y-5 pt-2 relative z-10">
            {/* Google Login Trigger */}
            <button
              onClick={handleSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-brand-bg hover:bg-brand-gold hover:text-black border border-brand-gold/40 hover:border-brand-gold text-brand-text font-mono uppercase tracking-widest text-[10px] font-bold py-3 px-4 rounded-xl transition-all duration-150 fast-transition snappy-press shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign In with Google
            </button>

            {/* Separator Line */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-[1px] bg-brand-border flex-1" />
              <span className="text-[9px] font-mono text-brand-text-muted/65 uppercase tracking-widest">Or access with email</span>
              <div className="h-[1px] bg-brand-border flex-1" />
            </div>

            {/* Email Intake Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted block pl-0.5">
                  Email ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dev.bhushan.g.m@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-0.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted block">
                    Password / OTP
                  </label>
                  <span className="text-[9px] text-brand-gold/60 font-sans italic">Optional</span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!emailInput.trim()}
                className="w-full bg-brand-gold hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 text-black font-mono uppercase tracking-widest text-[10px] font-bold py-3 rounded-xl transition-all duration-150 fast-transition snappy-press shadow-lg shadow-brand-gold/10 cursor-pointer"
              >
                Access Portal Workspace
              </button>

              <p className="text-[9px] text-brand-text-muted/75 font-sans text-center leading-relaxed italic bg-brand-bg p-3 rounded-xl border border-brand-border/40">
                💡 **Pro Tip**: To view the pre-filled legal filings, use: <br/>
                <span className="font-mono text-brand-gold font-bold">dev.bhushan.g.m@gmail.com</span> (any password)
              </p>
            </form>

            <div className="flex items-center justify-between text-[8px] font-mono text-brand-text-muted/50 border-t border-brand-border/60 pt-4">
              <span>TLS 1.3 Secure Session</span>
              <span>256-Bit SSL Encrypted Ledger</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CLIENT PORTAL MAIN VIEW ---
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Portal Top Bar / Profile Header */}
      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 subtle-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-brand-gold/40 overflow-hidden shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "Client"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-text">
              {user.displayName || "Incroute Client Member"}
            </h3>
            <p className="text-[10px] font-mono text-brand-text-muted flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
              {user.email} (Secure Active Session)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => user.email && fetchOrders(user.email)}
            disabled={loadingOrders}
            className="text-[9px] font-mono uppercase tracking-widest text-brand-gold border border-brand-gold/30 hover:border-brand-gold bg-brand-gold/5 px-3.5 py-2 rounded-xl transition-all duration-150 fast-transition snappy-press cursor-pointer font-bold flex items-center gap-1.5"
          >
            {loadingOrders ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh Ledger"}
          </button>
          <button
            onClick={handleSignOut}
            className="text-[9px] font-mono uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-red-500/15 hover:border-red-500/30 px-3.5 py-2 rounded-xl transition-all duration-150 fast-transition snappy-press cursor-pointer font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>

      {loadingOrders && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          <p className="mt-3 text-xs font-mono text-brand-text-muted">Synching database files...</p>
        </div>
      ) : orders.length === 0 ? (
        
        // --- NO INCORPORATIONS REGISTERED ---
        <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6 relative overflow-hidden premium-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
          <div className="inline-flex p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-brand-gold">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-light text-brand-text serif">No Active Incorporations Identified</h4>
            <p className="text-xs text-brand-text-muted max-w-md mx-auto leading-relaxed">
              We couldn't identify any active registrations matching your secure email **({user.email})**. 
              Initiate your first business structure or post-incorporation checklist on the registrations catalog tab!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                // Find registrations tab button and click it to switch
                const servicesTab = document.querySelector('[data-tab="services"]') as HTMLButtonElement;
                if (servicesTab) servicesTab.click();
              }}
              className="inline-flex items-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono hover:scale-105 transition-all shadow-lg shadow-brand-gold/15 cursor-pointer"
            >
              Start New Onboarding <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (

        // --- DASHBOARD CONTAINER ---
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: CASE SUMMARY LIST (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#9E896A] font-semibold pl-1">
              Your Registered Ventures ({orders.length})
            </div>
            
            <div className="space-y-4">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      // Clear messages history when switching cases to load clean prompt context
                      setChatMessages([
                        {
                          id: `welcome-${order.id}`,
                          role: "assistant",
                          content: `Hello! I am your dedicated **LegisCorp Compliance Director**. I have loaded all statutory information and history logs for **"${order.companyName}"**.\n\nAsk me anything regarding missing checklist items, notarization procedures, or immediate statutory duties!`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                    className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-150 fast-transition relative overflow-hidden group premium-card ${
                      isSelected
                        ? "bg-brand-card border-brand-gold/45 shadow-xl shadow-brand-gold/5"
                        : "bg-brand-bg-lighter border-brand-border hover:border-[#9E896A]/30 hover:bg-brand-bg-lighter/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-xl rounded-full" />
                    )}

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/15 px-2 py-0.5 rounded font-bold">
                          {order.id}
                        </span>
                        <span className="text-[9px] font-mono text-brand-text-muted font-medium">{order.createdAt}</span>
                      </div>

                      <div>
                        <h4 className={`text-sm font-semibold tracking-wide transition-colors leading-snug ${isSelected ? "text-brand-gold font-serif" : "text-brand-text"}`}>
                          {order.companyName}
                        </h4>
                        <p className="text-[10px] text-brand-text-muted font-sans mt-0.5">{order.firmType}</p>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-brand-text-muted">
                          <span>Completion Progress</span>
                          <span className="font-bold text-brand-text">{order.stepProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-gold rounded-full transition-all duration-500"
                            style={{ width: `${order.stepProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: CASE DETAIL INSPECTOR (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {selectedOrder && (
              <>
                {/* Granular Case Inspector Header */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 subtle-glow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
                  
                  <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-mono bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded font-bold uppercase">
                          Active Case File
                        </span>
                        <span className="text-[9px] font-mono text-brand-text-muted uppercase tracking-widest">{selectedOrder.id}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-light text-brand-text serif tracking-wide mt-1">
                        {selectedOrder.companyName}
                      </h2>
                      <p className="text-xs text-brand-text-muted font-sans">{selectedOrder.firmType}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[8px] font-mono text-brand-text-muted uppercase block">Status Phase</span>
                        <span className="text-[10px] font-mono uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2.5 py-1 rounded font-semibold mt-1 inline-block">
                          {selectedOrder.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. VISUAL PROGRESS STEPPER */}
                  <div className="space-y-4 pt-2 relative z-10">
                    <div className="text-[10px] font-bold uppercase text-[#9E896A] tracking-widest font-mono pl-1">
                      Filing Stage Milestone Tracker
                    </div>

                    {/* Timeline Node Flow */}
                    <div className="relative pt-6 pb-2">
                      {/* Line */}
                      <div className="absolute top-[28px] left-6 right-6 h-[2px] bg-brand-border z-0" />
                      
                      <div className="grid grid-cols-5 relative z-10">
                        {getStepperStages(selectedOrder.status).map((step, idx) => {
                          const isCompleted = step.state === "completed";
                          const isActive = step.state === "active";
                          
                          return (
                            <div key={step.id} className="flex flex-col items-center text-center space-y-2.5">
                              <div
                                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${
                                  isActive
                                    ? "bg-brand-gold text-black border-brand-gold scale-125 shadow-lg shadow-brand-gold/25"
                                    : isCompleted
                                    ? "bg-brand-gold/15 text-brand-gold border-brand-gold/50"
                                    : "bg-brand-bg text-brand-text-muted border-brand-border"
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                              </div>
                              <div className="hidden sm:block">
                                <span className={`text-[9px] font-mono uppercase tracking-wider block font-semibold transition-colors ${
                                  isActive ? "text-brand-gold font-bold" : "text-brand-text-muted"
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STATUTORY DOCUMENT CHECKLIST & UPLOADS */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 subtle-glow">
                  <div className="border-b border-brand-border pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-light text-brand-text serif">Required Onboarding Credentials</h3>
                      <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest">Client Document Checklist Ledger</p>
                    </div>
                    <span className="text-[9px] font-mono text-brand-text-muted">
                      Uploaded: <span className="font-bold text-brand-text">{selectedOrder.checklist.filter(i => i.uploadedFile).length}</span> / {selectedOrder.checklist.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {selectedOrder.checklist.map((item) => {
                      const isPending = item.status === "pending";
                      const isApproved = item.status === "approved";
                      const isRejected = item.status === "rejected";
                      const isUploading = uploadingItem === item.id;

                      return (
                        <div 
                          key={item.id}
                          className="p-4 bg-brand-bg border border-brand-border rounded-xl transition-all duration-150 fast-transition hover:border-brand-gold/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 premium-card"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              {isApproved && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                              {isPending && <Clock className="w-4 h-4 text-brand-gold shrink-0 animate-pulse" />}
                              {isRejected && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                              
                              <h4 className="text-xs font-semibold text-brand-text leading-snug">{item.name}</h4>
                            </div>

                            {item.uploadedFile ? (
                              <p className="text-[10px] text-brand-text-muted font-mono flex items-center gap-1">
                                <FileText className="w-3 h-3 text-brand-gold" />
                                {item.uploadedFile} ({item.size})
                              </p>
                            ) : (
                              <p className="text-[9px] text-brand-text-muted/60 font-sans italic">
                                * Missing credentials. Action required.
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 w-full md:w-auto">
                            {isUploading ? (
                              <div className="flex items-center justify-center gap-2 border border-brand-border bg-brand-bg px-4 py-2.5 rounded-lg text-[10px] font-mono text-brand-text-muted w-full md:w-auto">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                                Submitting...
                              </div>
                            ) : isApproved ? (
                              <span className="flex items-center justify-center gap-1.5 border border-green-500/10 bg-green-500/5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider text-green-400 w-full md:w-auto">
                                Approved
                              </span>
                            ) : (
                              <label className="flex items-center justify-center gap-2 border border-brand-gold/30 hover:border-brand-gold bg-brand-gold/5 hover:bg-brand-gold hover:text-black px-4 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold text-brand-gold cursor-pointer transition-all duration-150 fast-transition snappy-press w-full md:w-auto">
                                <Upload className="w-3.5 h-3.5 shrink-0" />
                                {item.uploadedFile ? "Re-upload File" : "Upload Document"}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                                  onChange={(e) => handleFileUpload(item.id, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CONTEXTUAL GEMINI AI ADVISOR DRAWER */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 subtle-glow flex flex-col h-[550px]">
                  
                  {/* Chat Header */}
                  <div className="border-b border-brand-border pb-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-brand-gold/10 border border-brand-gold/25 rounded-lg text-brand-gold shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-light text-brand-text serif">LegisCorp Compliance Consultant</h3>
                        <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block animate-pulse"></span>
                          Gemini 3.5 Assistant Active
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-bold px-2 py-0.5 rounded font-mono uppercase">
                      Advisor Model
                    </span>
                  </div>

                  {/* Chat Conversation Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2 font-sans text-xs">
                    
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 px-4">
                        <Sparkles className="w-7 h-7 text-brand-gold animate-bounce" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-brand-text font-serif">Consultancy Room Ready</h4>
                          <p className="text-[10px] text-brand-text-muted max-w-sm">
                            Query the Senior Registrar regarding specific filing duties, missing PAN requirements, stamp fees, or ROC timelines.
                          </p>
                        </div>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line border ${
                          msg.role === "user" 
                            ? "bg-brand-gold/10 border-brand-gold/25 text-brand-text" 
                            : "bg-brand-bg border-brand-border text-brand-text"
                        }`}>
                          {msg.content}
                          <span className="text-[8px] font-mono text-brand-text-muted/65 block mt-2 text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {loadingChat && (
                      <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                        <div className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border text-brand-text flex items-center gap-2 font-mono text-[10px]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                          Consulting Registry Ledger...
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input Intake */}
                  <form onSubmit={handleSendChat} className="border-t border-brand-border pt-4 shrink-0 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the compliance director a question..."
                      className="flex-1 bg-brand-input-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-brand-text-muted/35 focus:border-brand-gold focus:outline-none fast-transition"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || loadingChat}
                      className="bg-brand-gold hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 text-black px-4 rounded-xl transition-all duration-150 fast-transition snappy-press cursor-pointer flex items-center justify-center shrink-0 shadow-lg shadow-brand-gold/10"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* 4. CASE STATUTORY HISTORY LOGS */}
                <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 subtle-glow">
                  <div className="border-b border-brand-border pb-4">
                    <h3 className="text-base font-light text-brand-text serif">Secure Ledger Activity Logs</h3>
                    <p className="text-[9px] text-brand-text-muted font-mono uppercase tracking-widest">Chronological Case History Log</p>
                  </div>

                  <div className="relative pl-6 space-y-6 border-l border-brand-border">
                    {selectedOrder.history.map((log, idx) => (
                      <div key={idx} className="relative space-y-1">
                        {/* Bullet */}
                        <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-brand-gold border border-black shadow" />
                        
                        <span className="text-[9px] font-mono text-brand-gold font-bold block">{log.date}</span>
                        <p className="text-xs text-brand-text/95 leading-relaxed font-sans">{log.activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
