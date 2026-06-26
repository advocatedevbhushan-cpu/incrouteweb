// Firebase has been fully removed. All auth/data uses MySQL via REST API.
// This file is kept only so existing imports don't break at compile time.

export const auth = null;
export const db = null;
export const storage = null;

export interface DocumentRecord {
  id?: string;
  userId: string;
  name: string;
  type: string;
  fileUrl: string;
  status: "pending" | "verified" | "rejected";
  createdAt?: any;
}
