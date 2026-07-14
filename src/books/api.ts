export class BooksApiError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
  }
}

function token(): string {
  return localStorage.getItem("incroute_access_token") || "";
}

export async function booksApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/portal/books${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token()}`,
      ...init?.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new BooksApiError(data.error || "INCroute Books request failed", data.code, response.status);
  return data as T;
}

export function inr(value: string | number | null | undefined): string {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
}

export function indianDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

