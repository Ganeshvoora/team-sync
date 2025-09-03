import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  try {
    console.log('🧪 Testing admin login credentials...')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123',
    })

    if (error) {
      console.log('❌ Login failed:', error.message)
      return
    }

    if (data.user) {
      console.log('✅ Login successful!')
      console.log('👤 User ID:', data.user.id)
      console.log('📧 Email:', data.user.email)
      console.log('✉️ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
      
      // Test admin verification
      console.log('\n🔐 Testing admin verification...')
      const response = await fetch('http://localhost:3001/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session?.access_token}`
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Admin verification successful:', result)
      } else {
        const errorData = await response.json()
        console.log('❌ Admin verification failed:', errorData)
      }

      // Sign out
      await supabase.auth.signOut()
      console.log('🚪 Signed out successfully')
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testLogin()
