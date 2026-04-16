import { redirect } from "next/navigation";

/**
 * Root route — redirects to the admin runs page.
 */
export default function RootPage() {
  redirect("/runs");
}
