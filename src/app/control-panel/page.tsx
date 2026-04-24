import { redirect } from "next/navigation";

export default async function Page() {
  redirect("/control-panel/dashboard-overview");
}
