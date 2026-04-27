import { redirect } from "next/navigation";

/**
 * Registration is disabled — redirect to login.
 */
export default function RegisterPage() {
  redirect("/login");
}
