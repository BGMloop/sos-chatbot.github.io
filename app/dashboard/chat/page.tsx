import { redirect } from "next/navigation";

export default function ChatIndexPage() {
  // Redirect to the dashboard when users hit /dashboard/chat directly
  redirect("/dashboard");
} 