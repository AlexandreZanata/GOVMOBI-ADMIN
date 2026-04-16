"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authFacade } from "@/facades/authFacade";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/models/Auth";
import type { ApiError } from "@/types";

/** Key used to persist the post-login redirect URL in sessionStorage. */
const REDIRECT_KEY = "govmobile.redirect_url";

/**
 * Mutation hook for authenticating a user via CPF and password.
 *
 * On success the hook stores the user profile in the auth Zustand store,
 * reads an optional redirect URL from `sessionStorage`, and navigates
 * the user to that URL (or `/` when none is stored).  The redirect entry
 * is removed from `sessionStorage` after navigation.
 *
 * @returns `mutate`, `isPending`, `isError`, and `error` from the mutation.
 */
export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<AuthUser, ApiError, { cpf: string; senha: string }>({
    mutationFn: ({ cpf, senha }) => authFacade.login(cpf, senha),

    onSuccess: (user) => {
      setUser(user);

      const redirectUrl =
        typeof window !== "undefined"
          ? sessionStorage.getItem(REDIRECT_KEY)
          : null;

      if (redirectUrl) {
        sessionStorage.removeItem(REDIRECT_KEY);
        router.push(redirectUrl);
      } else {
        router.push("/");
      }
    },
  });
}
