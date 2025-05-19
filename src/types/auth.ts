export type UserRole = "admin" | "manager" | "user";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}
