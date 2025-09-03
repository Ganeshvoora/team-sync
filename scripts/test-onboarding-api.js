// Test the onboarding API endpoint
async function testOnboardingAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.user@example.com',
        name: 'Test User',
        contactNumber: '+9876543210',
        skills: 'Python, Django, PostgreSQL',
        bio: 'New graduate looking to start career in tech.',
        employeeId: 'EMP002'
      }),
    })

    const result = await response.json()
    console.log('API Response:', result)
    
    if (response.ok) {
      console.log('✅ Onboarding API test successful!')
    } else {
      console.log('❌ Onboarding API test failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

testOnboardingAPI()
