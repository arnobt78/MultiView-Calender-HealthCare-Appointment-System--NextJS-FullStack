import Login from "@/components/login/Login";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Doctor Patient Calendar account to manage appointments, view schedules, and access your calendar dashboard.",
  keywords: ["login", "sign in", "authentication", "calendar login", "appointment system login"],
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;
  return <Login redirect={redirect ?? null} />;
}
