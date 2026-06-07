import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { 
  auth, 
  getUserProfile, 
  saveUserProfile, 
  signUpWithEmail as fbSignUpWithEmail,
  signInWithEmail as fbSignInWithEmail,
  logout as fbLogout,
  googleSignIn as fbGoogleSignIn
} from "./firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface TimelineMilestone {
  id: string;
  days: string;
  title: string;
  form: string;
  description: string;
  penalty: string;
  tip: string;
  owner: "government" | "expert" | "client";
  status: "pending" | "in_progress" | "completed";
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: "customer" | "partner" | "admin";
  fullName: string;
  createdAt: string;
  progress?: number;
  projectStatus?: "active" | "completed";
  completedAt?: string | null;
  timeline?: TimelineMilestone[];
}

export const getDefaultTimeline = (): TimelineMilestone[] => [
  {
    id: "1",
    days: "1-2 Days",
    title: "Name Availability Search & RUN Filing",
    form: "MCA RUN Application",
    description: "Our legal expert conducts trademark feasibility checks and files the name reservation application (RUN) on the MCA portal.",
    penalty: "Rejection of proposed name if similar to existing names, requiring re-filing.",
    tip: "Provide 2 unique, brandable names to speed up approval chances!",
    owner: "expert",
    status: "pending"
  },
  {
    id: "2",
    days: "2-3 Days",
    title: "MoA / AoA Drafting & KYC Document Sign-off",
    form: "Subscriber MoA/AoA Sheets & Consent Forms",
    description: "Client uploads promoter PAN, Aadhaar, address proofs, and digital signatures. Expert structures MOA/AOA drafts.",
    penalty: "Delayed submission of KYC halts the incorporation file drafting.",
    tip: "Ensure proofs have matches to PAN details exactly to avoid CRC queries!",
    owner: "client",
    status: "pending"
  },
  {
    id: "3",
    days: "3-4 Days",
    title: "SPICe+ Incorporation Form Lodgement",
    form: "Form INC-32, e-MOA & e-AOA",
    description: "Legiscorp expert compiles all director consents, NOCs, utility address proofs, and submits SPICe+ bundle on MCA.",
    penalty: "Compounding processing fees on MCA if forms are rejected twice for signature mismatch.",
    tip: "Digital signatures must be valid Class 3 credentials.",
    owner: "expert",
    status: "pending"
  },
  {
    id: "4",
    days: "4-5 Days",
    title: "Central Registration Centre Verification & COI Issue",
    form: "Certificate of Incorporation (COI)",
    description: "Government officers verify SPICe+ filings, allocate unique Corporate ID Number (CIN), and issue official COI.",
    penalty: "Resubmission query (re-submission limit of 15 days) if government officers find spelling mismatch in proofs.",
    tip: "CRC officers usually review files within 72 hours of submission.",
    owner: "government",
    status: "pending"
  },
  {
    id: "5",
    days: "5-6 Days",
    title: "Statutory PAN & TAN Allotment",
    form: "Income Tax Department PAN / TAN Cards",
    description: "Government automated channels assign statutory tax IDs (PAN/TAN) linked to the new CIN.",
    penalty: "Inability to register for GST or open banking channels without active PAN.",
    tip: "PAN and TAN details are physical cards dispatched to the registered office address.",
    owner: "government",
    status: "pending"
  },
  {
    id: "6",
    days: "6-7 Days",
    title: "Zero-Balance Corporate Bank Account & Capital Deposit",
    form: "Corporate Bank Account Activation",
    description: "Client opens bank account utilizing COI and PAN, and deposits the authorized subscriber capital.",
    penalty: "Failure to deposit share capital within 180 days results in strike-off warning by Registrar.",
    tip: "Keep the capital deposit bank receipt safe as it is mandatory proof for MCA!",
    owner: "client",
    status: "pending"
  },
  {
    id: "7",
    days: "30 Days",
    title: "First Board Meeting & Auditor Appointment (ADT-1)",
    form: "First Board Minutes & Form ADT-1 CA Consent",
    description: "Expert drafts first board resolution and appoints statutory CA auditor (Form ADT-1) on behalf of client.",
    penalty: "₹300 per day late filing fees on company and potential disqualification risks.",
    tip: "First board meeting must be held within 30 days of incorporation date.",
    owner: "expert",
    status: "pending"
  },
  {
    id: "8",
    days: "180 Days",
    title: "Commencement of Business Certificate (Form 20A)",
    form: "Form 20A Declaration & Bank Proof Upload",
    description: "Government review of the deposited share capital bank statement and approval of Commencement of Business certificate.",
    penalty: "₹50,000 flat penalty on company and registry will block trading operations.",
    tip: "Company cannot execute contracts or commence commercial trading until Form 20A is approved!",
    owner: "government",
    status: "pending"
  }
];

export const checkAccountExpiration = (prof: any): boolean => {
  if (prof && prof.role === "customer" && prof.projectStatus === "completed" && prof.completedAt) {
    const completedDate = new Date(prof.completedAt);
    const ninetyDaysInMillis = 90 * 24 * 60 * 60 * 1000;
    const expirationDate = new Date(completedDate.getTime() + ninetyDaysInMillis);
    return new Date() > expirationDate;
  }
  return false;
};

export interface AdminCreateUserResult {
  uid: string;
  email: string;
  password: string;
  fullName: string;
  role: "customer" | "partner";
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, fullName: string, role: "customer" | "partner") => Promise<void>;
  signInWithGoogle: (roleForNewUser?: "customer" | "partner") => Promise<void>;
  logoutUser: () => Promise<void>;
  activateMockSession: (email: string, role: "customer" | "partner" | "admin", fullName?: string) => void;
  adminCreateUser: (email: string, password: string, fullName: string, role: "customer" | "partner", assignedPartnerId?: string) => Promise<AdminCreateUserResult>;
  updateCustomerProfile: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);
  // Flag to prevent onAuthStateChanged from overwriting profile already set by signIn/signUp
  const profileSetByAction = useRef(false);

  // Initialize Auth state listener
  useEffect(() => {
    // Check if there's a stored mock session first
    const savedMockSession = localStorage.getItem("incroute_mock_session");
    if (savedMockSession) {
      try {
        const session = JSON.parse(savedMockSession);
        if (checkAccountExpiration(session.profile)) {
          localStorage.removeItem("incroute_mock_session");
        } else {
          setUser(session.user);
          setProfile(session.profile);
          setIsMock(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem("incroute_mock_session");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If signIn/signUp already loaded the profile, skip re-fetching
        if (profileSetByAction.current) {
          profileSetByAction.current = false;
          setLoading(false);
          return;
        }
        try {
          const prof = await getUserProfile(fbUser.uid);
          if (prof) {
            if (checkAccountExpiration(prof)) {
              console.warn("User account expired (90 days post-completion). Logging out.");
              await fbLogout();
              setUser(null);
              setProfile(null);
              sessionStorage.setItem("incroute_auth_expired", "true");
              setLoading(false);
              return;
            }

            const finalProf = {
              ...prof,
              ...(prof.role === "customer" && !prof.timeline ? {
                progress: prof.progress !== undefined ? prof.progress : 0,
                projectStatus: prof.projectStatus || "active",
                completedAt: prof.completedAt || null,
                timeline: getDefaultTimeline()
              } : {})
            };

            setUser(fbUser);
            setProfile(finalProf as UserProfile);
            setIsMock(false);
          } else {
            setUser(fbUser);
            setProfile(null);
            setIsMock(false);
          }
        } catch (error: any) {
          console.error("Error fetching Firestore user profile:", error);
          setUser(fbUser);
          setProfile(null);
          setIsMock(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsMock(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const activateMockSession = (email: string, role: "customer" | "partner" | "admin", fullName?: string) => {
    setIsMock(true);
    const mockUid = `mock-${role}-${Math.floor(Math.random() * 10000)}`;
    const name = fullName || `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    
    const mockUser = {
      uid: mockUid,
      email: email,
      displayName: name,
    };

    // Load mock users to see if profile exists
    const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
    let existingProfile = mockUsers.find((u: any) => u.email === email);

    if (existingProfile) {
      if (checkAccountExpiration(existingProfile)) {
        throw new Error("This workspace has expired 90 days after project completion.");
      }
    }

    const mockProfile: UserProfile = existingProfile ? {
      ...existingProfile,
      ...(existingProfile.role === "customer" && !existingProfile.timeline ? {
        progress: existingProfile.progress !== undefined ? existingProfile.progress : 0,
        projectStatus: existingProfile.projectStatus || "active",
        completedAt: existingProfile.completedAt || null,
        timeline: getDefaultTimeline()
      } : {})
    } : {
      uid: mockUid,
      email: email,
      fullName: name,
      role: role,
      createdAt: new Date().toISOString(),
      ...(role === "customer" ? {
        progress: 0,
        projectStatus: "active",
        completedAt: null,
        timeline: getDefaultTimeline()
      } : {})
    };

    // Store/Update in mock users collection
    if (!existingProfile) {
      mockUsers.push(mockProfile);
      localStorage.setItem("incroute_mock_users", JSON.stringify(mockUsers));
    } else if (existingProfile.role === "customer" && !existingProfile.timeline) {
      const updated = mockUsers.map((u: any) => u.email === email ? mockProfile : u);
      localStorage.setItem("incroute_mock_users", JSON.stringify(updated));
    }

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem("incroute_mock_session", JSON.stringify({ user: mockUser, profile: mockProfile }));
  };

  const signIn = async (email: string, pass: string) => {
    try {
      const fbUser = await fbSignInWithEmail(email, pass);
      // Set the flag IMMEDIATELY so onAuthStateChanged skips its own profile fetch
      profileSetByAction.current = true;

      let prof = await getUserProfile(fbUser.uid, fbUser.email || undefined);

      if (!prof) {
        // No Firestore profile found — auto-create one from Firebase Auth data.
        // This handles first-time setup where admin hasn't created the Firestore doc yet.
        console.log("[Auth] No profile found. Auto-creating from Firebase Auth data...");

        // Determine role: check if any other users exist in the system
        // If no users exist at all, this must be the first admin setup
        let autoRole: "admin" | "customer" = "customer";
        try {
          const { getAllUserProfiles } = await import("./firebase");
          const existingUsers = await getAllUserProfiles();
          if (existingUsers.length === 0) {
            // First user in the system = admin
            autoRole = "admin";
            console.log("[Auth] First user in system — assigning admin role.");
          }
        } catch {
          // If we can't read users list, default to customer for safety
          autoRole = "customer";
        }

        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email,
          fullName: fbUser.displayName || email.split("@")[0] || "User",
          role: autoRole,
          createdAt: new Date().toISOString(),
          ...(autoRole === "customer" ? {
            progress: 0,
            projectStatus: "active",
            completedAt: null,
            timeline: getDefaultTimeline()
          } : {})
        };

        try {
          await saveUserProfile(fbUser.uid, newProfile);
          console.log(`[Auth] Profile auto-created with role: ${autoRole}`);
        } catch (saveErr) {
          console.warn("[Auth] Could not save auto-created profile to Firestore:", saveErr);
        }

        prof = newProfile as any;
      }

      if (prof) {
        if (checkAccountExpiration(prof)) {
          await fbLogout();
          throw new Error("Your workspace access has expired 90 days after project completion.");
        }

        const finalProf = {
          ...prof,
          ...(prof.role === "customer" && !prof.timeline ? {
            progress: prof.progress !== undefined ? prof.progress : 0,
            projectStatus: prof.projectStatus || "active",
            completedAt: prof.completedAt || null,
            timeline: getDefaultTimeline()
          } : {})
        };

        setUser(fbUser);
        setProfile(finalProf as UserProfile);
        setIsMock(false);
      }
    } catch (err: any) {
      profileSetByAction.current = false;
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        console.warn("Firebase email auth disabled, logging in via mock local mode...");
        const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
        const found = mockUsers.find((u: any) => u.email === email);
        if (found) {
          activateMockSession(email, found.role, found.fullName);
        } else {
          const role = email.includes("partner") ? "partner" : email.includes("admin") ? "admin" : "customer";
          activateMockSession(email, role);
        }
      } else {
        throw err;
      }
    }
  };

  const signUp = async (email: string, pass: string, fullName: string, role: "customer" | "partner") => {
    try {
      const fbUser = await fbSignUpWithEmail(email, pass);
      const profileData: UserProfile = {
        uid: fbUser.uid,
        email,
        fullName,
        role,
        createdAt: new Date().toISOString(),
        ...(role === "customer" ? {
          progress: 0,
          projectStatus: "active",
          completedAt: null,
          timeline: getDefaultTimeline()
        } : {})
      };
      await saveUserProfile(fbUser.uid, profileData);
      profileSetByAction.current = true;
      setUser(fbUser);
      setProfile(profileData);
      setIsMock(false);
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        console.warn("Firebase email sign-up disabled, creating account via mock local mode...");
        activateMockSession(email, role, fullName);
      } else {
        throw err;
      }
    }
  };

  const signInWithGoogle = async (roleForNewUser: "customer" | "partner" = "customer") => {
    try {
      const res = await fbGoogleSignIn();
      if (res) {
        const { user: fbUser } = res;
        const prof = await getUserProfile(fbUser.uid);
        if (prof) {
          if (checkAccountExpiration(prof)) {
            await fbLogout();
            throw new Error("Your workspace access has expired 90 days after project completion.");
          }
          
          const finalProf = {
            ...prof,
            ...(prof.role === "customer" && !prof.timeline ? {
              progress: prof.progress !== undefined ? prof.progress : 0,
              projectStatus: prof.projectStatus || "active",
              completedAt: prof.completedAt || null,
              timeline: getDefaultTimeline()
            } : {})
          };
          
          profileSetByAction.current = true;
          setUser(fbUser);
          setProfile(finalProf as UserProfile);
        } else {
          // Create new customer profile in Firestore for first-time Google users
          const profileData: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || "",
            fullName: fbUser.displayName || "Google User",
            role: roleForNewUser,
            createdAt: new Date().toISOString(),
            ...(roleForNewUser === "customer" ? {
              progress: 0,
              projectStatus: "active",
              completedAt: null,
              timeline: getDefaultTimeline()
            } : {})
          };
          await saveUserProfile(fbUser.uid, profileData);
          profileSetByAction.current = true;
          setUser(fbUser);
          setProfile(profileData);
        }
        setIsMock(false);
      }
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        console.warn("Google authentication is disabled or blocked. Booting mock Google session.");
        activateMockSession("google-user@incroute.com", roleForNewUser, "Google Tester");
      } else {
        throw err;
      }
    }
  };


  const logoutUser = async () => {
    // Clear state synchronously first so UI switches immediately to login
    setUser(null);
    setProfile(null);
    setIsMock(false);
    try {
      if (isMock) {
        localStorage.removeItem("incroute_mock_session");
      } else {
        await fbLogout();
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  /**
   * Admin-only: Create a new user account WITHOUT signing out the current admin.
   * Uses Firebase REST API to create the account server-side style,
   * or falls back to mock localStorage creation in isMock mode.
   */
  const adminCreateUser = async (
    email: string,
    password: string,
    fullName: string,
    role: "customer" | "partner",
    assignedPartnerId?: string
  ): Promise<AdminCreateUserResult> => {
    // Generate a unique mock UID for local/mock mode
    const mockUid = `${role}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const newProfile: UserProfile = {
      uid: mockUid,
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      ...(role === "customer" ? {
        progress: 0,
        projectStatus: "active",
        completedAt: null,
        timeline: getDefaultTimeline(),
        ...(assignedPartnerId ? { assignedPartnerId } : {})
      } : {
        ...(assignedPartnerId ? { assignedPartnerId } : {})
      })
    };

    if (isMock) {
      // Mock mode: store directly in localStorage
      const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
      const existing = mockUsers.find((u: any) => u.email === email);
      if (existing) throw new Error(`An account with email "${email}" already exists.`);

      // Also store login credentials for mock sign-in
      const mockCreds = JSON.parse(localStorage.getItem("incroute_mock_credentials") || "[]");
      mockCreds.push({ email, password, uid: mockUid });
      localStorage.setItem("incroute_mock_credentials", JSON.stringify(mockCreds));
      mockUsers.push(newProfile);
      localStorage.setItem("incroute_mock_users", JSON.stringify(mockUsers));

      // Log welcome email simulation to console
      console.log(
        `%c📧 WELCOME EMAIL SENT TO: ${email}\n` +
        `Name: ${fullName}\n` +
        `Role: ${role.toUpperCase()}\n` +
        `Login: https://legiscorp.in/portal\n` +
        `Email: ${email}\n` +
        `Password: ${password}\n` +
        `(This is a simulated email — integrate EmailJS or SendGrid for production)`,
        "background: #1a1a2e; color: #ffd700; padding: 8px; font-size: 12px; border-left: 3px solid #ffd700;"
      );

      return { uid: mockUid, email, password, fullName, role };
    } else {
      // Real Firebase: Use Firebase REST API to create auth user without signing admin out
      // We use the Firebase Admin-style REST endpoint via the web API key
      try {
        const configResponse = await import("../../firebase-applet-config.json");
        const apiKey = (configResponse as any).default?.apiKey || (configResponse as any).apiKey;

        const signUpRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: false })
          }
        );

        if (!signUpRes.ok) {
          const errBody = await signUpRes.json();
          const fbMsg = errBody?.error?.message || "Firebase user creation failed";
          if (fbMsg === "EMAIL_EXISTS") throw new Error(`An account with email "${email}" already exists.`);
          throw new Error(fbMsg);
        }

        const signUpData = await signUpRes.json();
        const newUid = signUpData.localId;

        // Save profile to Firestore
        const profileToSave: any = {
          ...newProfile,
          uid: newUid,
          ...(assignedPartnerId ? { assignedPartnerId } : {})
        };
        await saveUserProfile(newUid, profileToSave);

        // Log simulated welcome email
        console.log(
          `%c📧 WELCOME EMAIL — ${email}\nName: ${fullName} | Role: ${role.toUpperCase()}\nLogin URL: https://legiscorp.in/portal\nEmail: ${email}\nPassword: ${password}`,
          "background: #0d0d1a; color: #ffd700; padding: 8px; font-size: 12px;"
        );

        return { uid: newUid, email, password, fullName, role };
      } catch (err: any) {
        throw err;
      }
    }
  };

  /**
   * Update a customer's Firestore profile (used by partner/admin for milestone, progress, assignment updates).
   */
  const updateCustomerProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    if (isMock) {
      const mockUsers = JSON.parse(localStorage.getItem("incroute_mock_users") || "[]");
      const updated = mockUsers.map((u: any) => u.uid === uid ? { ...u, ...updates } : u);
      localStorage.setItem("incroute_mock_users", JSON.stringify(updated));
    } else {
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() } as any);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isMock,
        signIn,
        signUp,
        signInWithGoogle,
        logoutUser,
        activateMockSession,
        adminCreateUser,
        updateCustomerProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
