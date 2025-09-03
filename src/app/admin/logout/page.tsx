import { redirect } from "next/navigation"

export default function AdminLogoutPage() {
  // Redirect to main logout since we don't need a separate admin logout
  redirect('/logout')
}