require('dotenv').config({ path: '.env.local' })

async function testOpenRouterAPI() {
  console.log('🔍 Testing OpenRouter API Key...')
  console.log('Key present:', !!process.env.OPENAI_API_KEY)
  console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...')
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
    console.log('❌ Please update your .env.local file with a valid OpenRouter API key')
    console.log('   Get one at: https://openrouter.ai')
    return
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'CNY Business Concierge Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Hello, this is a test. Please respond with "API working!"' }
        ],
        max_tokens: 50
      })
    })

    console.log('📡 Response status:', response.status)

    if (response.status === 200) {
      const data = await response.json()
      const message = data.choices[0]?.message?.content
      console.log('✅ SUCCESS! API Response:', message)
      console.log('🎉 Your OpenRouter API key is working correctly!')
    } else if (response.status === 401) {
      console.log('❌ AUTHENTICATION FAILED')
      console.log('   Your API key is invalid. Please:')
      console.log('   1. Check your key at https://openrouter.ai')
      console.log('   2. Make sure you copied it correctly')
      console.log('   3. Update .env.local with the correct key')
    } else if (response.status === 402) {
      console.log('💳 PAYMENT REQUIRED')
      console.log('   Your account needs credits. Please:')
      console.log('   1. Go to https://openrouter.ai')
      console.log('   2. Add credits to your account')
    } else {
      const errorText = await response.text()
      console.log('❌ ERROR:', response.status, errorText)
    }

  } catch (error) {
    console.log('❌ Network Error:', error.message)
  }
}

testOpenRouterAPI()