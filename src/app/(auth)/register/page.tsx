import { RegisterForm } from "@/components/organisms/RegisterForm";

/**
 * Registration page rendered within the `(auth)` route group layout.
 *
 * This is a server component that renders the client-side `RegisterForm`
 * organism. The auth layout provides the centered, minimal container
 * without the admin shell.
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
