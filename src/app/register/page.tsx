import { Register } from "@/components/register/Register";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account for Doctor Patient Calendar to start managing appointments, schedules, and calendar events.",
  keywords: ["register", "sign up", "create account", "calendar registration", "appointment system signup"],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <Register />;
}
