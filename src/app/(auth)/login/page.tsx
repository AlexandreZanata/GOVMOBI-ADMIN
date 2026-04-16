import { LoginForm } from "@/components/organisms/LoginForm";

/**
 * Login page rendered within the `(auth)` route group layout.
 *
 * This is a server component that renders the client-side `LoginForm`
 * organism. The auth layout provides the centered, minimal container
 * without the admin shell.
 */
export default function LoginPage() {
  return <LoginForm />;
}
