import { redirect } from "next/navigation"

export default function AdminLoginPage() {
  // Redirect to main login page since we don't need a separate admin login
  redirect('/login')
}