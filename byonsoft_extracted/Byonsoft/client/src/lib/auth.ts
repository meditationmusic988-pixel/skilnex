export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  subscription_status: boolean;
}

export function getToken(): string | null {
  return localStorage.getItem("byonsoft_token");
}

export function setToken(token: string): void {
  localStorage.setItem("byonsoft_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("byonsoft_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
