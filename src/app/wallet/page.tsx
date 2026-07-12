import { redirect } from "next/navigation";

// Wallet is merged into the dashboard — keep the old route working.
export default function WalletPage() {
  redirect("/dashboard");
}
