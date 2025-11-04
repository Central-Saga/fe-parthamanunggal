import { redirect } from "next/navigation";

// Server-side redirect from root to login page
export default function Home() {
  redirect("/auth/login");
}
