// Use the Next.js same-origin proxy by default so browser requests work on
// localhost without CORS failures. Set NEXT_PUBLIC_API_URL for a hosted API.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiProduct {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  original_price?: number | null;
  stock: number;
  badge?: string | null;
  colors: string[];
  sizes: string[];
  images: string[];
  specs: Record<string, string>;
  rating: number;
  review_count: number;
  is_active: boolean;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Something went wrong');
  return body as T;
}
