// Firebase has been removed. All auth/data uses MySQL via REST API.
// This file provides stub exports for backward compatibility.

export const auth = null;
export const db = null;
export const storage = null;
export const initAuth = () => {};
export const googleSignIn = async () => null;
export const getAccessToken = async () => null;
export const logout = async () => {};
export const signUpWithEmail = async (_e: string, _p: string) => ({ uid: "" } as any);
export const signInWithEmail = async (_e: string, _p: string) => ({ uid: "" } as any);
export const getUserProfile = async () => null;
export const saveUserProfile = async () => {};
export const getAllUserProfiles = async () => [];
export const uploadDocumentFile = () => ({ promise: Promise.resolve(""), cancel: () => {} });
export const deleteDocumentFile = async () => {};
export const createDocumentRecord = async () => ({ id: "" });
export const deleteDocumentRecord = async () => {};
export const updateDocumentStatus = async () => {};

export interface DocumentRecord {
  id?: string;
  userId: string;
  name: string;
  type: string;
  fileUrl: string;
  status: "pending" | "verified" | "rejected";
  createdAt?: any;
}
