import { redirect } from "next/navigation";

/**
 * Root route — redirects to the admin dashboard page.
 */
export default function RootPage() {
  redirect("/dashboard");
}
