import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, businesses, hasMapAccess } = await request.json()
    
    console.log('Chat API received:')
    console.log('- Message:', message)
    console.log('- Businesses type:', typeof businesses)
    console.log('- Businesses length:', businesses ? businesses.length : 'undefined')
    console.log('- Has map access:', hasMapAccess)

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await generateChatResponse(message, businesses || [], hasMapAccess)

    // Check if the response mentions a specific business that should be shown on map
    let showOnMap = null
    if (hasMapAccess && businesses) {
      // Look for business names in the response
      for (const business of businesses) {
        if (response.toLowerCase().includes(business.name.toLowerCase())) {
          showOnMap = business.name
          break
        }
      }
    }

    return NextResponse.json({ 
      response,
      showOnMap 
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}