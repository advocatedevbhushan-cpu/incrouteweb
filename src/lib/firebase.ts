import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/forms.body');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, pass: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  return cred.user;
};

// Email/Password Login
export const signInWithEmail = async (email: string, pass: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
};

// Get user profile from Firestore by UID (document ID)
// Checks 'users' and 'admin' collections, falls back to email search
export const getUserProfile = async (uid: string, email?: string) => {
  // Check in both 'users' and 'admin' collections (in case doc was created in wrong collection)
  const collectionsToCheck = ['users', 'admin'];
  for (const col of collectionsToCheck) {
    try {
      const docRef = doc(db, col, uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Auto-migrate: if found outside 'users', copy it there so future lookups are instant
        if (col !== 'users') {
          console.log(`[Auth] Found profile in '${col}' collection. Migrating to 'users'...`);
          await setDoc(doc(db, 'users', uid), { ...data, uid }, { merge: true });
        }
        return { ...data, uid };
      }
    } catch (e) {
      // Collection may not be covered by rules — continue to next
      console.warn(`[Auth] Could not read from '${col}' collection:`, e);
    }
  }

  // Final fallback: search 'users' collection by email field
  if (email) {
    try {
      console.warn(`[Auth] UID lookup failed for ${uid}. Searching by email: ${email}`);
      const q = query(collection(db, 'users'), where('email', '==', email));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const foundData = qSnap.docs[0].data();
        console.log('[Auth] Found by email. Auto-migrating to correct UID doc...');
        await setDoc(doc(db, 'users', uid), { ...foundData, uid }, { merge: true });
        return { ...foundData, uid };
      }
    } catch (e) {
      console.warn('[Auth] Email fallback query failed:', e);
    }
  }

  return null;
};

// Save or merge user profile in Firestore
export const saveUserProfile = async (uid: string, data: any) => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
};


// Fetch all profiles (for admin/partner panels)
export const getAllUserProfiles = async () => {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  const profiles: any[] = [];
  snap.forEach((doc) => {
    profiles.push({ uid: doc.id, ...doc.data() });
  });
  return profiles;
};

// --- Storage Upload / Delete Operations ---

export const uploadDocumentFile = (
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const storagePath = `customers/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
};

export const deleteDocumentFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file from Storage:', error);
    throw error;
  }
};

// --- Firestore Document Collection Operations ---

export interface DocumentRecord {
  id?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'verified' | 'rejected';
  verifierComment?: string;
  verifiedAt?: any;
  createdAt: any;
}

export const createDocumentRecord = async (docData: Omit<DocumentRecord, 'createdAt'>) => {
  const docRef = collection(db, 'documents');
  const newDoc = await addDoc(docRef, {
    ...docData,
    createdAt: serverTimestamp()
  });
  return newDoc.id;
};

export const deleteDocumentRecord = async (docId: string) => {
  const docRef = doc(db, 'documents', docId);
  await deleteDoc(docRef);
};

export const updateDocumentStatus = async (
  docId: string,
  status: 'verified' | 'rejected',
  comment?: string
) => {
  const docRef = doc(db, 'documents', docId);
  const updateData: any = {
    status,
    verifiedAt: serverTimestamp()
  };
  if (status === 'rejected') {
    updateData.verifierComment = comment || 'No reason provided';
  } else {
    updateData.verifierComment = ''; // clear comment on verify
  }
  await updateDoc(docRef, updateData);
};

