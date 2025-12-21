import Logout from "@/components/logout/Logout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logout",
  description: "Sign out from your Doctor Patient Calendar account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LogoutPage() {
  return <Logout />;
}
