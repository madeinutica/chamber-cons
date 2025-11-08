import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Enhanced RAG Chat API with Schema.org metadata and intelligent summaries
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log('Chat API received message:', message);

    // Fetch all businesses for initial filtering
    const { data: allBusinesses, error } = await supabase
      .from('businesses')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch business data' },
        { status: 500 }
      );
    }

    // Smart RAG retrieval: Find most relevant businesses using keyword matching
    const lowerMessage = message.toLowerCase();
    const relevantBusinesses = allBusinesses?.filter((b: any) => {
      const summary = (b.intelligent_summary || b.description || '').toLowerCase();
      const name = b.name.toLowerCase();
      const category = (b.category || '').toLowerCase();
      const keywords = (b.keywords || []).join(' ').toLowerCase();
      const services = (b.service_type || []).join(' ').toLowerCase();
      
      // Score relevance
      let score = 0;
      if (name.includes(lowerMessage)) score += 10;
      if (category.includes(lowerMessage)) score += 8;
      if (summary.includes(lowerMessage)) score += 5;
      if (keywords.includes(lowerMessage)) score += 3;
      if (services.includes(lowerMessage)) score += 3;
      
      return score > 0;
    }).slice(0, 15) || []; // Top 15 most relevant for RAG context

    // If no specific matches, use top-rated businesses
    const businesses = relevantBusinesses.length > 0 
      ? relevantBusinesses 
      : allBusinesses?.slice(0, 20) || [];

    // Build enhanced RAG context using intelligent summaries and schema data
    const ragContext = businesses.map((b: any) => {
      const summary = b.intelligent_summary || b.description || '';
      const keywords = b.keywords?.join(', ') || '';
      const services = b.service_type?.join(', ') || '';
      const amenities = b.amenities?.join(', ') || '';
      
      return `
Business: ${b.name}
Category: ${b.category}
Summary: ${summary}
Keywords: ${keywords}
Services: ${services}
Amenities: ${amenities}
Phone: ${b.phone}
Website: ${b.website || 'N/A'}
Address: ${b.address}
Rating: ${b.rating}/5
${b.veteran_owned ? '✓ Veteran-Owned' : ''}
${b.woman_owned ? '✓ Woman-Owned' : ''}
${b.minority_owned ? '✓ Minority-Owned' : ''}
${b.is_nonprofit ? '✓ Non-Profit' : ''}
      `.trim();
    }).join('\n\n---\n\n') || '';

    // Use OpenAI API if available, otherwise use enhanced fallback
    if (openaiApiKey) {
      try {
        const systemPrompt = `You are a helpful business concierge for the Chamber of Commerce. 
You have access to detailed business information including Schema.org metadata and AI-generated summaries.
Use the provided business data to give accurate, helpful responses about local businesses.
When recommending businesses, mention their key features, services, and any special designations (veteran-owned, woman-owned, etc.).
Be conversational and friendly while providing specific, actionable information.

BUSINESS DATA:
${ragContext}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.2-3b-instruct:free', // Low-cost free model for chat
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 600
          })
        });

        if (!response.ok) {
          throw new Error('OpenRouter API request failed');
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

        return NextResponse.json({ 
          response: aiResponse,
          showOnMap: null,
          enhanced: true 
        });

      } catch (aiError) {
        console.error('OpenAI API error, falling back to enhanced search:', aiError);
      }
    }

    // Enhanced fallback: Intelligent keyword matching using summaries
    const searchQuery = message.toLowerCase();
    const matchedBusinesses = businesses?.filter((b: any) => {
      const summary = (b.intelligent_summary || b.description || '').toLowerCase();
      const name = b.name.toLowerCase();
      const keywords = (b.keywords || []).join(' ').toLowerCase();
      const services = (b.service_type || []).join(' ').toLowerCase();
      
      return summary.includes(searchQuery) || 
             name.includes(searchQuery) ||
             keywords.includes(searchQuery) ||
             services.includes(searchQuery);
    }).slice(0, 5) || [];

    if (matchedBusinesses.length > 0) {
      const recommendations = matchedBusinesses.map((b: any) => {
        const badges = [];
        if (b.veteran_owned) badges.push('Veteran-Owned');
        if (b.woman_owned) badges.push('Woman-Owned');
        if (b.minority_owned) badges.push('Minority-Owned');
        if (b.is_nonprofit) badges.push('Non-Profit');
        
        return `• **${b.name}** (${b.rating}/5 ⭐)
  ${b.intelligent_summary || b.description}
  📞 ${b.phone}
  🌐 ${b.website || 'No website'}
  ${badges.length > 0 ? `✨ ${badges.join(' • ')}` : ''}`;
      }).join('\n\n');

      const fallbackResponse = `I found ${matchedBusinesses.length} businesses that might help:\n\n${recommendations}\n\nWould you like more information about any of these?`;

      return NextResponse.json({ 
        response: fallbackResponse,
        showOnMap: matchedBusinesses.map((b: any) => ({ id: b.id, name: b.name })),
        enhanced: true 
      });
    }

    // Generic helpful response when no matches
    const fallbackResponse = `I'd be happy to help you find local businesses! I can assist with:
    
• Finding businesses by category (restaurants, healthcare, retail, etc.)
• Searching for specific services or products
• Locating veteran-owned, woman-owned, or minority-owned businesses
• Getting contact information and ratings

What type of business are you looking for?`;

    return NextResponse.json({ 
      response: fallbackResponse,
      showOnMap: null,
      enhanced: true 
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message.' },
      { status: 500 }
    );
  }
}
