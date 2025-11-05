require('dotenv').config({ path: '.env.local' })

// Test the chat functionality directly
async function testChat() {
  try {
    console.log('Testing chat functionality...')
    console.log('API Key present:', !!process.env.OPENAI_API_KEY)
    
    // Sample business data (sports bars that would have wings)
    const testBusinesses = [
      {
        name: "12 North Sports Bar",
        category: "Food & Beverage",
        description: "Lively sports bar serving pub fare and drinks in a casual setting. Known for its TVs broadcasting sporting events, creating a social atmosphere for sports enthusiasts. Wide selection of beers and appetizers.",
        rating: 4.2,
        address: "10125 Mulaney Rd, Utica, NY 13502",
        phone: "(315) 732-9039"
      },
      {
        name: "El señor tequila Bar y Grill", 
        category: "Food & Beverage",
        description: "Mexican bar and grill offering authentic cuisine, tequila, and a family-friendly atmosphere for gatherings.",
        rating: 4.1,
        address: "New Hartford, NY",
        phone: "(315) 555-0123"
      },
      {
        name: "Old School Bar & Grill",
        category: "Food & Beverage", 
        description: "Classic bar and grill experience offering traditional American fare and drinks.",
        rating: 4.0,
        address: "Utica, NY",
        phone: "(315) 797-1980"
      }
    ]

    const userMessage = "Who has the best chicken wings?"
    
    // Test the OpenRouter API directly
    const businessContext = testBusinesses.map(b => 
      `${b.name} (${b.category}) - ${b.description.substring(0, 100)}... Rating: ${b.rating}/5, Address: ${b.address}, Phone: ${b.phone}`
    ).join('\n')

    const systemPrompt = `You are the CNY Business Concierge for the Central New York Chamber of Commerce business directory. You help users find specific local businesses and provide detailed information about services, hours, locations, and contact details.

IMPORTANT: Only recommend and discuss businesses that are actually in our directory (listed below). Do not make up or suggest businesses that aren't listed.

Current businesses in our directory:
${businessContext}

Your role:
- Help users find specific businesses from our directory
- Provide exact contact information, addresses, and details from the listings
- Recommend businesses based on category, rating, or special features (veteran-owned, featured, etc.)
- Give directions and location guidance
- Answer questions about business hours, services, and ratings
- If a user asks about a business type we don't have, let them know what similar options are available

Guidelines:
- Be conversational and helpful
- Always use actual business information from the directory
- Include phone numbers, addresses, and ratings when relevant
- Highlight veteran-owned and featured businesses when appropriate
- If our directory doesn't have what they're looking for, mention what we do have instead
- Keep responses focused on our local CNY businesses`

    console.log('Making OpenRouter API request...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'CNY Business Concierge'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    console.log('OpenRouter response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      throw new Error(`OpenRouter API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('OpenRouter response received')
    const aiResponse = data.choices[0]?.message?.content
    
    console.log('\n=== CHAT RESPONSE ===')
    console.log(aiResponse)
    console.log('===================\n')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testChat()