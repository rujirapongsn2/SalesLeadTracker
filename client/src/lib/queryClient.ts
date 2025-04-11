import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText;
    try {
      // Try to parse as JSON first
      const errorJson = await res.json();
      errorText = errorJson.message || JSON.stringify(errorJson);
    } catch {
      // If not JSON, get as text
      errorText = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Get current user from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    // Prepare headers
    const headers: Record<string, string> = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add authentication headers if user is logged in
    if (currentUser) {
      headers['X-User-ID'] = currentUser.id.toString();
      headers['X-User-Role'] = currentUser.role;
      headers['X-User-Name'] = currentUser.name;
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // For login endpoint, we want to return the response even if it's not OK
    // so that we can handle authentication errors in the login function
    if (url === '/api/login') {
      return res;
    }
    
    // For other endpoints, throw if not OK
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get current user from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add authentication headers if user is logged in
    if (currentUser) {
      headers['X-User-ID'] = currentUser.id.toString();
      headers['X-User-Role'] = currentUser.role;
      headers['X-User-Name'] = currentUser.name;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
