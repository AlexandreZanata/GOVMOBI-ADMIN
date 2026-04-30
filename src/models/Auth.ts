import type { Permission } from "@/models/Permission";
import type { UserRole } from "@/models/User";

/**
 * Authenticated user profile returned by GET /auth/me.
 */
export interface AuthUser {
  /** Unique user identifier. */
  id: string;
  /** Full display name. */
  nome: string;
  /** CPF (11 unformatted digits). */
  cpf: string;
  /** User email address. */
  email: string;
  /** Role that defines permission scope. */
  role: UserRole;
  /** Resolved permissions for the authenticated user. */
  permissions: Permission[];
  /** Public URL of the profile photo, or null when not set. */
  fotoPerfilUrl?: string | null;
}

/**
 * JWT token pair returned by login and refresh endpoints.
 */
export interface TokenPair {
  /** Short-lived access token (Bearer). */
  accessToken: string;
  /** Long-lived refresh token used to obtain new access tokens. */
  refreshToken: string;
}

/**
 * Payload for POST /auth/login.
 */
export interface LoginInput {
  /** CPF — 11 unformatted digits. */
  cpf: string;
  /** User password. */
  senha: string;
}

/**
 * Payload for POST /auth/register.
 */
export interface RegisterInput {
  /** Full name of the servidor. */
  nome: string;
  /** CPF — 11 unformatted digits. */
  cpf: string;
  /** Email address. */
  email: string;
  /** Phone number. */
  telefone: string;
  /** Position (cargo) identifier. */
  cargoId: string;
  /** Department (lotação) identifier. */
  lotacaoId: string;
  /** Password (minimum 8 characters). */
  senha: string;
}

/**
 * TanStack Query key factory for auth-related queries.
 */
export const authKeys = {
  /** Root key for all auth queries. */
  all: ["auth"] as const,
  /** Key for the current user profile query. */
  me: () => ["auth", "me"] as const,
};
