import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsClient from "@/components/SettingsClient"

export default async function SettingsPage() {
  // Get current user using Supabase
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the user in our database by email
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
      department: true,
      manager: {
        include: {
          role: true,
        },
      },
    },
  })

  if (!currentUser) {
    redirect('/login')
  }

  return (
    <SettingsClient 
      currentUser={currentUser}
    />
  )
}
