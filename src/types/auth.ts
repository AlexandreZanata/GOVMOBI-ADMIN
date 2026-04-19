/**
 * Auth-specific API types.
 *
 * Re-exports auth model types from `@/models/Auth` for consistency
 * with the project convention of importing types from `@/types`.
 */
export type {
  AuthUser,
  TokenPair,
  LoginInput,
  RegisterInput,
} from "@/models/Auth";

export { authKeys } from "@/models/Auth";
