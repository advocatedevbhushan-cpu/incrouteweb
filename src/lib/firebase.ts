// Firebase removed — all auth/data now uses MySQL via REST API
// This file provides stub exports so existing imports don't break

export const auth = {} as any;
export const db = {} as any;
export const storage = {} as any;

export const initAuth = () => {};
export const googleSignIn = async () => null;
export const getAccessToken = async () => null;
export const logout = async () => {};
export const signUpWithEmail = async (email: string, pass: string) => ({ uid: "", email } as any);
export const signInWithEmail = async (email: string, pass: string) => ({ uid: "", email } as any);
export const getUserProfile = async (uid: string, email?: string) => null;
export const saveUserProfile = async (uid: string, data: any) => {};
export const getAllUserProfiles = async () => [];

export const uploadDocumentFile = (userId: string, file: File, onProgress?: (p: number) => void) => {
  return { promise: Promise.resolve(""), cancel: () => {} };
};
export const deleteDocumentFile = async (fileUrl: string) => {};

export interface DocumentRecord {
  id?: string;
  userId: string;
  name: string;
  type: string;
  fileUrl: string;
  status: "pending" | "verified" | "rejected";
  createdAt?: any;
}

export const createDocumentRecord = async (docData: any) => ({ id: "" });
export const deleteDocumentRecord = async (docId: string) => {};
export const updateDocumentStatus = async (docId: string, status: string, reviewedBy?: string) => {};
