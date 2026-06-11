import { redirect } from "next/navigation";

// The root URL redirects to the dashboard
// In a real app with auth, this would check session first
export default function RootPage() {
  redirect("/dashboard");
}
