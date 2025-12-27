import type { ApiResponse } from "../../shared/schema";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Clone the response before reading it
      const clonedRes = res.clone();
      const errorData: ApiResponse = await clonedRes.json();
      const error = new Error(errorData.message || res.statusText);
      (error as any).status = res.status;
      (error as any).accountDeactivated = errorData.error === 'account_deactivated';
      throw error;
    } catch {
      // If JSON parsing fails, fall back to text
      const clonedRes = res.clone();
      const text = await clonedRes.text() || res.statusText;
      const error = new Error(`${res.status}: ${text}`);
      (error as any).status = res.status;
      throw error;
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Remove any leading slashes from the URL to prevent double slashes
  const cleanUrl = url.replace(/^\/+/, '');
  
  // Get base URL from environment or use default based on environment
  let baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If no explicit API URL is set, use appropriate default based on environment
  if (!baseUrl) {
    if (typeof window !== 'undefined' && window.location.hostname === 'www.investpro.website') {
      baseUrl = 'https://www.investpro.website';
    } else {
      baseUrl = 'http://localhost:8000';
    }
  }
  
  // Remove any trailing slashes from baseUrl
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  // Combine base URL and clean URL
  const fullUrl = `${baseUrl}/${cleanUrl}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers: Record<string, string> = {};
  
  // Only set Content-Type for JSON data
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
      credentials: 'include',
    });
    
    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    throw error;
  }
}

export async function queryFn<T>({ queryKey }: { queryKey: unknown[] }): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  let url = queryKey[0] as string;
  
  if (url.startsWith('/')) {
    url = `${baseUrl}${url}`;
  }
  
  const res = await fetch(url, {
    headers,
    credentials: 'include',
  });
  
  await throwIfResNotOk(res);
  
  const result: ApiResponse<T> = await res.json();
  return result.data!;
}
