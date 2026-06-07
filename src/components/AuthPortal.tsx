import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Briefcase,
  Users,
  Activity,
  Award,
  Globe,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  signUpWithEmail, 
  signInWithEmail, 
  getUserProfile, 
  saveUserProfile, 
  getAllUserProfiles 
} from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function AuthPortal() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"client" | "partner">("client");
  const [isMockAuth, setIsMockAuth] = useState(false);
  
  // Form Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Client specific details
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [entityType, setEntityType] = useState("Private Limited");

  // Partner specific details
  const [firmRegistrationNo, setFirmRegistrationNo] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [tempExpertise, setTempExpertise] = useState("");

  // UI status
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Admin simulation console state
  const [isAdminView, setIsAdminView] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch custom user profile from Firestore
        try {
          const userProf = await getUserProfile(user.uid);
          if (userProf) {
            setProfile(userProf);
          } else {
            // Profile doesn't exist, create a default client one
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "New User",
              role: "client",
              createdAt: new Date().toISOString()
            };
            await saveUserProfile(user.uid, defaultProfile);
            setProfile(defaultProfile);
          }
        } catch (err: any) {
          console.error("Error fetching user profile:", err.message);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Load admin list if admin view is active
  useEffect(() => {
    if (isAdminView) {
      loadUsersForAdmin();
    }
  }, [isAdminView]);

  const activateLocalMockSession = (emailAddress: string, selectedRole: string) => {
    setIsMockAuth(true);
    const mockUid = `mock-${selectedRole}-${Math.floor(Math.random() * 10000)}`;
    const mockUser: any = {
      uid: mockUid,
      email: emailAddress,
      displayName: `Demo ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
    };
    
    const mockProfile: any = {
      uid: mockUid,
      email: emailAddress,
      displayName: mockUser.displayName,
      role: selectedRole === "admin" ? "admin" : selectedRole,
      createdAt: new Date().toISOString()
    };

    if (selectedRole === "client") {
      mockProfile.profile = {
        phoneNumber: "+91 8707552183",
        companyName: "Demo Client Corporation (Simulated)",
        entityType: "Private Limited"
      };
    } else if (selectedRole === "partner") {
      mockProfile.status = "pending";
      mockProfile.profile = {
        phoneNumber: "+91 9876543210",
        firmRegistrationNo: "CA-DEMO-99 (Simulated)",
        city: "Delhi",
        state: "Delhi NCR",
        expertise: ["Taxation", "ROC Filings", "GST Setup"]
      };
    } else if (selectedRole === "admin") {
      mockProfile.profile = {
        phoneNumber: "+91 0000000000"
      };
    }

    setCurrentUser(mockUser);
    setProfile(mockProfile);
    setAuthSuccess(`Simulated Login successful as Demo ${selectedRole}!`);
  };

  const loadUsersForAdmin = async () => {
    setAdminLoading(true);
    try {
      if (isMockAuth) {
        setUsersList([
          {
            uid: profile?.uid || "mock-admin-id",
            displayName: profile?.displayName || "Demo Admin",
            email: profile?.email || "admin@incroute.com",
            role: "admin",
            profile: { phoneNumber: "+91 0000000000" }
          },
          {
            uid: "mock-partner-1",
            displayName: "Sharma & Partners CA",
            email: "partner@incroute.com",
            role: "partner",
            status: "pending",
            profile: {
              phoneNumber: "+91 9876543210",
              firmRegistrationNo: "CA-DEMO-99",
              city: "Delhi",
              state: "Delhi NCR",
              expertise: ["Taxation", "ROC Filings"]
            }
          },
          {
            uid: "mock-client-1",
            displayName: "Dev Bhushan",
            email: "client@incroute.com",
            role: "client",
            profile: {
              phoneNumber: "+91 8707552183",
              companyName: "Client Ventures",
              entityType: "Private Limited"
            }
          }
        ]);
      } else {
        const list = await getAllUserProfiles();
        setUsersList(list);
      }
    } catch (err) {
      console.error("Failed loading user list:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthSuccess("");
    setActionLoading(true);
    try {
      await signInWithEmail(email, password);
      setAuthSuccess("Logged in successfully!");
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        const inferredRole = email.includes("partner") ? "partner" : email.includes("admin") ? "admin" : "client";
        activateLocalMockSession(email, inferredRole);
      } else {
        setAuthError(err.message || "Failed to log in. Please check credentials.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setAuthError("All fields are required.");
      return;
    }
    setAuthError("");
    setAuthSuccess("");
    setActionLoading(true);
    try {
      const user = await signUpWithEmail(email, password);
      
      // Build profile based on chosen role
      const profileData: any = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString()
      };

      if (role === "client") {
        profileData.profile = {
          phoneNumber: phone,
          companyName: companyName,
          entityType: entityType
        };
      } else {
        profileData.status = "pending"; // Partners start as pending approval
        profileData.profile = {
          phoneNumber: phone,
          firmRegistrationNo: firmRegistrationNo,
          city: city,
          state: state,
          expertise: expertise
        };
      }

      await saveUserProfile(user.uid, profileData);
      setProfile(profileData);
      setAuthSuccess("Account created successfully!");
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        activateLocalMockSession(email, role);
      } else {
        setAuthError(err.message || "Failed to create account.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: "client" | "partner" | "admin") => {
    const demoEmail = `${demoRole}@incroute.com`;
    const demoPass = "password123";
    
    setAuthError("");
    setAuthSuccess("");
    setActionLoading(true);
    
    try {
      // 1. Try to login
      try {
        await signInWithEmail(demoEmail, demoPass);
        setAuthSuccess(`Logged in as Demo ${demoRole}!`);
      } catch (loginErr: any) {
        if (loginErr.code === "auth/operation-not-allowed" || loginErr.message?.includes("operation-not-allowed")) {
          activateLocalMockSession(demoEmail, demoRole);
          return;
        }
        
        // 2. If login fails, register the user on the fly
        console.log(`Demo user not found. Registering ${demoEmail}...`);
        const user = await signUpWithEmail(demoEmail, demoPass);
        
        const profileData: any = {
          uid: user.uid,
          email: user.email,
          displayName: `Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`,
          role: demoRole === "admin" ? "admin" : demoRole,
          createdAt: new Date().toISOString()
        };

        if (demoRole === "client") {
          profileData.profile = {
            phoneNumber: "+91 8707552183",
            companyName: "Demo Client Corporation",
            entityType: "Private Limited"
          };
        } else if (demoRole === "partner") {
          profileData.status = "pending"; // Starts as pending to test approvals
          profileData.profile = {
            phoneNumber: "+91 9876543210",
            firmRegistrationNo: "CA-DEMO-99",
            city: "Delhi",
            state: "Delhi NCR",
            expertise: ["Taxation", "ROC Filings", "GST Setup"]
          };
        } else if (demoRole === "admin") {
          profileData.profile = {
            phoneNumber: "+91 0000000000"
          };
        }

        await saveUserProfile(user.uid, profileData);
        setProfile(profileData);
        setAuthSuccess(`Created and Logged in as Demo ${demoRole}!`);
      }
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        activateLocalMockSession(demoEmail, demoRole);
      } else {
        setAuthError(err.message || "Failed to trigger Demo sign-in.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const addExpertiseItem = () => {
    if (tempExpertise.trim() && !expertise.includes(tempExpertise.trim())) {
      setExpertise([...expertise, tempExpertise.trim()]);
      setTempExpertise("");
    }
  };

  const handleApprovePartner = async (uid: string) => {
    try {
      if (isMockAuth) {
        setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, status: "approved" } : u));
        if (profile && profile.uid === uid) {
          setProfile({ ...profile, status: "approved" });
        }
        setAuthSuccess("Partner approved successfully (Simulated)!");
      } else {
        await saveUserProfile(uid, { status: "approved" });
        setAuthSuccess("Partner approved successfully!");
        // Reload admin list
        await loadUsersForAdmin();
      }
    } catch (err: any) {
      setAuthError(err.message || "Approval failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ═══ AUTHENTICATED USER PORTAL RENDERING ═══
  if (currentUser && profile) {
    const isClient = profile.role === "client";
    const isPartner = profile.role === "partner";
    const isApprovedPartner = isPartner && profile.status === "approved";

    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">
              Account Workspace
            </span>
            <h1 className="text-2xl font-light text-brand-text serif">
              Welcome Back, <span className="text-brand-gold font-normal italic">{profile.displayName}</span>
            </h1>
            <p className="text-xs text-brand-text-muted">
              Role: <span className="font-semibold text-brand-text uppercase">{profile.role}</span>
              {isPartner && (
                <>
                  {" "}• Status:{" "}
                  <span className={`font-semibold uppercase ${isApprovedPartner ? "text-green-500" : "text-amber-500 animate-pulse"}`}>
                    {profile.status}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {/* Quick Simulation Switches */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="px-4 py-2 border border-brand-gold/30 hover:border-brand-gold text-brand-gold hover:text-black hover:bg-brand-gold text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-mono"
            >
              {isAdminView ? "Exit Admin View" : "Open Admin Simulator"}
            </button>
            <button
              onClick={async () => {
                await auth.signOut();
                setCurrentUser(null);
                setProfile(null);
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {isMockAuth && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs space-y-1 relative z-10">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Simulated Auth Session Active</span>
            </div>
            <p className="text-[10px] text-brand-text-muted leading-relaxed font-sans">
              Email/Password sign-in is disabled in your Firebase console. A local in-memory session is active so you can still preview the Client, Partner, and Admin dashboards. Enable <strong>Email/Password</strong> under <strong>Authentication &gt; Sign-in method</strong> in your Firebase Console to sync with the real database.
            </p>
          </div>
        )}

        {/* Global Notifications */}
        {authSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* ═══ ADMIN CONSOLE SIMULATOR ═══ */}
        {isAdminView ? (
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-lg font-light text-brand-text font-serif tracking-wide flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-gold" /> Admin Panel Simulator
              </h3>
              <button 
                onClick={loadUsersForAdmin} 
                className="text-xs text-brand-gold hover:underline"
              >
                Refresh List
              </button>
            </div>

            <p className="text-xs text-brand-text-muted leading-relaxed">
              Use this console to simulate admin reviews. Here you can see all registered users and approve pending partner applications immediately.
            </p>

            {adminLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-text-muted uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Name / Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Location / Firm Info</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((userProf) => (
                      <tr key={userProf.uid} className="border-b border-brand-border/60 hover:bg-brand-gold/5 transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-semibold text-brand-text">{userProf.displayName}</div>
                          <div className="text-[10px] text-brand-text-muted">{userProf.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="uppercase font-mono font-bold text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15">
                            {userProf.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-brand-text-muted">
                          {userProf.profile?.companyName && (
                            <div>Company: {userProf.profile.companyName} ({userProf.profile.entityType})</div>
                          )}
                          {userProf.profile?.firmRegistrationNo && (
                            <div>Reg: {userProf.profile.firmRegistrationNo} ({userProf.profile.city})</div>
                          )}
                          {!userProf.profile?.companyName && !userProf.profile?.firmRegistrationNo && (
                            <span className="italic">No detailed profile</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {userProf.role === "partner" ? (
                            <span className={`font-semibold uppercase text-[10px] ${userProf.status === "approved" ? "text-green-500" : "text-amber-500 animate-pulse"}`}>
                              {userProf.status || "pending"}
                            </span>
                          ) : (
                            <span className="text-brand-text-muted italic">Active</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {userProf.role === "partner" && userProf.status !== "approved" ? (
                            <button
                              onClick={() => handleApprovePartner(userProf.uid)}
                              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-brand-text-muted/40 italic">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-brand-text-muted italic">
                          No profiles registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ═══ CLIENT DASHBOARD VIEW ═══ */}
            {isClient && (
              <>
                <div className="lg:col-span-8 space-y-6">
                  {/* Prefilled filings overview */}
                  <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                      <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-light text-brand-text serif">Active Incorporations & Filings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-brand-bg border border-brand-border rounded-xl">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-text">Company Incorporation Application</h4>
                          <p className="text-xs text-brand-text-muted mt-1">Status: Document Review in Progress</p>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-full border border-brand-gold/20 font-bold">
                          Step 2 of 4
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-brand-bg border border-brand-border rounded-xl opacity-60">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-text">GST Registration Setup</h4>
                          <p className="text-xs text-brand-text-muted mt-1">Status: Waiting for Incorporation COI</p>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-brand-bg border border-brand-border px-2.5 py-1 rounded-full text-brand-text-muted">
                          Queued
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Items */}
                  <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-border pb-3">
                      <h4 className="text-sm font-bold text-brand-text">Bookmarked Tools & Services</h4>
                    </div>
                    <p className="text-xs text-brand-text-muted leading-relaxed">
                      You can save templates, guidelines, or checklists from our services list and tools page to view them quickly in your portal dashboard.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-gold/30 transition-colors space-y-2">
                        <span className="text-[9px] uppercase font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15">Tools</span>
                        <h5 className="text-xs font-bold text-brand-text">Registrar Name Feasibility Auditor</h5>
                        <p className="text-[10px] text-brand-text-muted">Audit and clearance check for brand name prefixes.</p>
                      </div>
                      <div className="p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-gold/30 transition-colors space-y-2">
                        <span className="text-[9px] uppercase font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15">Rules</span>
                        <h5 className="text-xs font-bold text-brand-text">ROC Compliance Roadmap</h5>
                        <p className="text-[10px] text-brand-text-muted">Mandatory post-incorporation checklist and timelines.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Profile details */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-6">
                    <div className="border-b border-brand-border pb-4">
                      <h4 className="text-sm font-bold text-brand-text">Company Information</h4>
                    </div>
                    
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Company Name</span>
                        <span className="text-brand-text font-semibold">{profile.profile?.companyName || "Not Set"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Entity Structure</span>
                        <span className="text-brand-text font-semibold">{profile.profile?.entityType || "Not Set"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Phone Number</span>
                        <span className="text-brand-text font-semibold">{profile.profile?.phoneNumber || "Not Set"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Email Address</span>
                        <span className="text-brand-text font-semibold">{profile.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══ PARTNER DASHBOARD VIEW (PENDING VS APPROVED) ═══ */}
            {isPartner && (
              <>
                {!isApprovedPartner ? (
                  <div className="lg:col-span-12 bg-brand-bg-lighter border border-brand-gold/20 rounded-2xl p-10 text-center space-y-6 max-w-3xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mx-auto text-brand-gold animate-pulse">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-light text-brand-text serif">Partner Application Pending Verification</h2>
                      <p className="text-sm text-brand-text-muted leading-relaxed max-w-md mx-auto">
                        Thank you for applying to be a verified INCroute partner. Our administrative board is reviewing your firm details and credentials. 
                      </p>
                    </div>
                    <div className="p-4 bg-brand-bg border border-brand-border rounded-xl text-left text-xs max-w-md mx-auto space-y-2.5">
                      <div className="flex items-center justify-between text-brand-text font-semibold border-b border-brand-border pb-1.5">
                        <span>Submitted Details:</span>
                        <span className="text-brand-gold font-mono uppercase font-bold text-[9px]">Status: Reviewing</span>
                      </div>
                      <div className="text-brand-text-muted space-y-1">
                        <div><strong className="text-brand-text">Firm Number:</strong> {profile.profile?.firmRegistrationNo}</div>
                        <div><strong className="text-brand-text">Location:</strong> {profile.profile?.city}, {profile.profile?.state}</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-xs text-brand-gold font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Tip: You can use the "Open Admin Simulator" button above to approve this partner immediately.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="lg:col-span-8 space-y-6">
                      {/* Active Lead Allocation */}
                      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-brand-border pb-4">
                          <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-light text-brand-text serif">Assigned Clients & Filings</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-brand-bg border border-brand-border rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-brand-text">Acme Technology Solutions</h4>
                              <span className="text-[10px] font-mono uppercase bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/15">Active</span>
                            </div>
                            <p className="text-xs text-brand-text-muted">Incorporation SPICe+ Part B forms, MoA/AoA vetting.</p>
                            <div className="border-t border-brand-border/60 pt-2 flex items-center justify-between text-[10px]">
                              <span className="text-brand-text-muted">Target Date: June 15, 2026</span>
                              <button className="text-brand-gold hover:underline font-semibold flex items-center gap-0.5">
                                View Vetting Portal <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-brand-bg border border-brand-border rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-brand-text">MedVibe Pharmacy LLP</h4>
                              <span className="text-[10px] font-mono uppercase bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/15">Active</span>
                            </div>
                            <p className="text-xs text-brand-text-muted">ROC Annual Filing and Form 3 registration vetting.</p>
                            <div className="border-t border-brand-border/60 pt-2 flex items-center justify-between text-[10px]">
                              <span className="text-brand-text-muted">Target Date: June 20, 2026</span>
                              <button className="text-brand-gold hover:underline font-semibold flex items-center gap-0.5">
                                View Vetting Portal <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Partner details */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 space-y-6">
                        <div className="border-b border-brand-border pb-4">
                          <h4 className="text-sm font-bold text-brand-text">Firm Credentials</h4>
                        </div>
                        
                        <div className="space-y-4 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Registration Number</span>
                            <span className="text-brand-text font-semibold">{profile.profile?.firmRegistrationNo}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Operating Location</span>
                            <span className="text-brand-text font-semibold">{profile.profile?.city}, {profile.profile?.state}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-brand-text-muted uppercase block">Filing Specialities</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {profile.profile?.expertise?.map((exp: string, idx: number) => (
                                <span key={idx} className="text-[9px] uppercase font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ═══ UNAUTHENTICATED SIGN-IN / SIGN-UP FORMS ═══
  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Dynamic Tab Switcher */}
      <div className="flex bg-brand-bg-lighter border border-brand-border rounded-xl p-1.5">
        <button
          onClick={() => { setActiveTab("signin"); setAuthError(""); setAuthSuccess(""); }}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === "signin" 
              ? "bg-brand-gold text-black font-bold shadow-md shadow-brand-gold/15" 
              : "text-brand-text-muted hover:text-brand-text"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setActiveTab("signup"); setAuthError(""); setAuthSuccess(""); }}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === "signup" 
              ? "bg-brand-gold text-black font-bold shadow-md shadow-brand-gold/15" 
              : "text-brand-text-muted hover:text-brand-text"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
        
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-light text-brand-text serif">
            {activeTab === "signin" ? "Login to Dashboard" : "Register Profile"}
          </h2>
          <p className="text-[10px] text-brand-text-muted font-mono uppercase tracking-widest font-semibold text-brand-gold">
            INCroute Portal Gateway
          </p>
        </div>

        {/* Status Alerts */}
        {isMockAuth && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs space-y-1 relative z-10 font-sans">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Simulated Auth Active</span>
            </div>
            <p className="text-[10px] text-brand-text-muted leading-relaxed">
              Email/Password sign-in is disabled in your Firebase Console. A local in-memory session is active so you can still preview the Client, Partner, and Admin dashboards. Enable <strong>Email/Password</strong> under <strong>Authentication &gt; Sign-in method</strong> in your Firebase Console to sync with the real database.
            </p>
          </div>
        )}
        {authError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2 relative z-10">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs flex items-start gap-2 relative z-10">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{authSuccess}</span>
          </div>
        )}

        <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-4 relative z-10">
          {/* Dynamic Registration Fields */}
          {activeTab === "signup" && (
            <>
              {/* Role Switcher */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block font-bold">Select Account Category *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-brand-text cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      value="client" 
                      checked={role === "client"} 
                      onChange={() => setRole("client")}
                      className="accent-brand-gold"
                    />
                    Client (Firm Owner)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-brand-text cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      value="partner" 
                      checked={role === "partner"} 
                      onChange={() => setRole("partner")}
                      className="accent-brand-gold"
                    />
                    Partner (CA / Legal Advisor)
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Full Name / Legal Entity *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
              <input
                type="email"
                required
                placeholder="e.g. corporate@incroute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Dynamic Details based on Sign Up role selection */}
          {activeTab === "signup" && (
            <div className="space-y-4 pt-2 border-t border-brand-border/40">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 8707552183"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>

              {/* CLIENT DETAILS */}
              {role === "client" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech Solutions"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Entity Structure Type</label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                      className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-gold cursor-pointer"
                    >
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="One Person Company">One Person Company (OPC)</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>
                </>
              )}

              {/* PARTNER DETAILS */}
              {role === "partner" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Firm Registration Number *</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CA-400123 / BAR-2025"
                        value={firmRegistrationNo}
                        onChange={(e) => setFirmRegistrationNo(e.target.value)}
                        className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">City *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lucknow"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">State *</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted/40" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Uttar Pradesh"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-brand-input-bg border border-brand-border rounded px-3 py-2 pl-9 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-brand-text-muted uppercase tracking-wider block">Filing Specialities / Expertise</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. GST Audits"
                        value={tempExpertise}
                        onChange={(e) => setTempExpertise(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExpertiseItem(); } }}
                        className="flex-1 bg-brand-input-bg border border-brand-border rounded px-3 py-2 text-xs text-brand-text placeholder-brand-text-muted/40 outline-none focus:border-brand-gold transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addExpertiseItem}
                        className="px-3 bg-brand-gold hover:bg-white text-black font-bold text-xs rounded transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Render current expertise items */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {expertise.map((item, idx) => (
                        <span key={idx} className="text-[9px] uppercase font-mono bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/15 flex items-center gap-1">
                          {item}
                          <button 
                            type="button" 
                            onClick={() => setExpertise(expertise.filter((_, i) => i !== idx))}
                            className="hover:text-red-500 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 shadow-lg shadow-brand-gold/10"
          >
            {actionLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {activeTab === "signin" ? "Sign In" : "Register Profile"}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {/* Quick Demo Sign-Ins */}
          <div className="pt-4 border-t border-brand-border/40 mt-4 space-y-3 relative z-10 text-center">
            <span className="text-[9px] font-mono text-brand-text-muted uppercase tracking-wider block font-bold">
              Or Sign In with Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("client")}
                className="px-2 py-1.5 bg-brand-bg hover:border-brand-gold border border-brand-border text-brand-text text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Demo Client
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("partner")}
                className="px-2 py-1.5 bg-brand-bg hover:border-brand-gold border border-brand-border text-brand-text text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Demo Partner
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="px-2 py-1.5 bg-brand-bg hover:border-brand-gold border border-brand-border text-brand-text text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
