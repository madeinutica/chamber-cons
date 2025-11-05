import { Business } from '@/types/business'

// Fallback responses for when AI API is not available
const fallbackResponses = {
  'wings': {
    keywords: ['wings', 'chicken wings', 'buffalo wings', 'hot wings'],
    response: (businesses: Business[]) => {
      const sportsBarsBarsGrills = businesses.filter(b => 
        b.category?.toLowerCase().includes('food') || 
        b.name.toLowerCase().includes('bar') ||
        b.name.toLowerCase().includes('grill') ||
        b.name.toLowerCase().includes('sports') ||
        b.description?.toLowerCase().includes('bar') ||
        b.description?.toLowerCase().includes('pub')
      )
      
      if (sportsBarsBarsGrills.length > 0) {
        const topRated = sportsBarsBarsGrills.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        const recommendation = topRated[0]
        
        return `For chicken wings, I'd recommend **${recommendation.name}**! ${recommendation.description?.substring(0, 100)}... They have a ${recommendation.rating}/5 star rating and are located at ${recommendation.address}. You can reach them at ${recommendation.phone}. ${sportsBarsBarsGrills.length > 1 ? `We also have ${sportsBarsBarsGrills.length - 1} other bars and grills in our directory that likely serve wings!` : ''}`
      }
      
      return "I don't see any specific mentions of chicken wings in our current business directory, but we have several sports bars and grills that would likely serve them. Would you like me to show you our restaurants and bars?"
    }
  },
  'restaurants': {
    keywords: ['restaurant', 'food', 'eat', 'dining', 'meal'],
    response: (businesses: Business[]) => {
      const restaurants = businesses.filter(b => 
        b.category?.toLowerCase().includes('food') || 
        b.category?.toLowerCase().includes('restaurant')
      )
      
      if (restaurants.length > 0) {
        const featured = restaurants.filter(b => b.featured).slice(0, 3)
        const toShow = featured.length > 0 ? featured : restaurants.slice(0, 3)
        
        return `We have ${restaurants.length} restaurants in our directory! Here are some top picks:\n\n${toShow.map(r => 
          `**${r.name}** - ${r.description?.substring(0, 80)}... (${r.rating}/5 stars) - ${r.phone}`
        ).join('\n\n')}`
      }
      
      return "Let me find our restaurant listings for you!"
    }
  },
  'business': {
    keywords: ['business', 'company', 'service'],
    response: (businesses: Business[]) => {
      return `I can help you find businesses in our Central New York directory! We have ${businesses.length} local businesses including restaurants, services, retail, healthcare, and more. What type of business are you looking for?`
    }
  }
}

export async function generateChatResponse(
  userMessage: string,
  businesses: Business[],
  hasMapAccess?: boolean
): Promise<string> {
  try {
    console.log('Starting chat response generation...')
    console.log('Number of businesses:', businesses ? businesses.length : 'undefined')
    console.log('API Key present:', !!process.env.OPENAI_API_KEY)
    console.log('Has map access:', hasMapAccess)
    
    // Handle case where businesses is undefined or not an array
    const businessArray = Array.isArray(businesses) ? businesses : []
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for fallback responses first
    for (const [key, config] of Object.entries(fallbackResponses)) {
      if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
        console.log(`Using fallback response for: ${key}`)
        return config.response(businessArray)
      }
    }
    
    // Try AI API if fallback didn't match
    const businessContext = businessArray.slice(0, 20).map(b => 
      `${b.name} (${b.category}) - ${b.description?.substring(0, 100)}... Rating: ${b.rating}/5, Address: ${b.address}, Phone: ${b.phone}`
    ).join('\n')

    const mapInstructions = hasMapAccess ? `

SPECIAL MAP CAPABILITY: You can show businesses on the map! When a user asks to "show on map", "see on map", "where is", or similar location requests, you can respond with specific businesses. When you want to show a business on the map, include the business name in your response and I'll automatically focus the map on that location.

Examples:
- User: "Can you show me New York Sash on the map?"
- You: "Absolutely! New York Sash is located at 1662 Sunset Ave, Utica, NY. They're a veteran-owned business specializing in window and door installation with a 4.8-star rating. I'm showing them on the map now so you can see their exact location."

- User: "Where is Utica Coffee Roasting Co?"
- You: "Utica Coffee Roasting Co is our featured coffee shop located in Utica, NY. They specialize in locally roasted coffee and have a 4.5-star rating. Let me show you their location on the map!"` : ''

    const systemPrompt = `You are the CNY Business Concierge for the Central New York Chamber of Commerce business directory. You help users find specific local businesses and provide detailed information about services, hours, locations, and contact details.

IMPORTANT: Only recommend and discuss businesses that are actually in our directory (listed below). Do not make up or suggest businesses that aren't listed.

Current businesses in our directory (showing first 20):
${businessContext}${mapInstructions}

Your role:
- Help users find specific businesses from our directory
- Provide exact contact information, addresses, and details from the listings
- Recommend businesses based on category, rating, or special features (veteran-owned, featured, etc.)
- Give directions and location guidance
- Answer questions about business hours, services, and ratings
- If a user asks about a business type we don't have, let them know what similar options are available
${hasMapAccess ? '- Show businesses on the interactive map when requested' : ''}

Guidelines:
- Be conversational and helpful
- Always use actual business information from the directory
- Include phone numbers, addresses, and ratings when relevant
- Highlight veteran-owned and featured businesses when appropriate
- If our directory doesn't have what they're looking for, mention what we do have instead
- Keep responses focused on our local CNY businesses
${hasMapAccess ? '- When users ask to see something on the map, mention the business name clearly in your response' : ''}`

    console.log('Making OpenRouter API request...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
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
    console.log('AI Response content:', aiResponse)

    return aiResponse || 
      "I apologize, but I'm having trouble processing your request right now. Please try asking about our local businesses again!"

  } catch (error) {
    console.error('OpenRouter API error:', error)
    
    // Enhanced fallback responses when AI is not available
    const businessArray = Array.isArray(businesses) ? businesses : []
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('wing')) {
      const sportsBarsBarsGrills = businessArray.filter(b => 
        b.category?.toLowerCase().includes('food') || 
        b.name.toLowerCase().includes('bar') ||
        b.name.toLowerCase().includes('grill') ||
        b.name.toLowerCase().includes('sports') ||
        b.description?.toLowerCase().includes('bar') ||
        b.description?.toLowerCase().includes('pub')
      )
      
      if (sportsBarsBarsGrills.length > 0) {
        const topRated = sportsBarsBarsGrills.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
        return `For chicken wings, I'd recommend **${topRated.name}**! They're a great sports bar/grill with a ${topRated.rating}/5 star rating, located at ${topRated.address}. You can reach them at ${topRated.phone}. ${topRated.description}`
      }
    }
    
    return `I'm currently having trouble with my AI responses, but I can still help you browse our business directory of ${businessArray.length} local CNY businesses! Try asking about specific business types like "restaurants", "shops", or "services".`
  }
}