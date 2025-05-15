import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  data?: any,
  method: string = "GET"
): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available (for cross-environment compatibility)
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: "include", // For session cookies
  };
  
  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }
  
  const res = await fetch(url, options);
  
  // Handle different error scenarios
  if (!res.ok) {
    // Special handling for auth failures
    if (res.status === 401) {
      console.error("Authentication failure at:", url);
      localStorage.removeItem('authToken');
    }
    
    await throwIfResNotOk(res);
  }
  
  try {
    return await res.json();
  } catch (e) {
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: HeadersInit = {};
    
    // Add auth token if available (for cross-environment compatibility)
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      headers['X-Auth-Token'] = authToken;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (res.status === 401) {
      // Clear token on auth failures
      if (authToken) {
        console.log("Clearing invalid auth token");
        localStorage.removeItem('authToken');
      }
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
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
