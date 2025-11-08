import { NextRequest, NextResponse } from 'next/server'

interface SemanticSearchResult {
  categories: string[]
  designations: string[]
  intent: string
  location?: string
  confidence: number
}

// Available categories from our actual database
const AVAILABLE_CATEGORIES = [
  'Legal Services',
  'Financial Services', 
  'Healthcare',
  'Restaurant',
  'Coffee & Tea',
  'Bakery',
  'Home Services',
  'Professional Services',
  'Real Estate',
  'Insurance',
  'Technology',
  'Education',
  'Arts & Culture',
  'Community Services',
  'Non-Profit',
  'Entertainment',
  'Automotive',
  'Retail',
  'Lodging',
  'Manufacturing',
  'Engineering',
  'Transportation',
  'Agriculture',
  'Energy & Utilities',
  'Government',
  'Media & Publishing',
  'Event Services',
  'Photography & Video',
  'Design Services',
  'Printing & Design',
  'Marketing & Advertising',
  'Security Services',
  'Associations',
  'Employment Services',
  'Health & Wellness',
  'Beauty & Spa',
  'Animal Welfare'
]

// Available designations
const AVAILABLE_DESIGNATIONS = [
  'veteran_owned',
  'woman_owned',
  'minority_owned',
  'is_nonprofit'
]

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenRouter API key not configured, using fallback matching')
      const fallbackResult = performFallbackMatching(query)
      return NextResponse.json(fallbackResult)
    }

    // Build RAG context with category examples and keyword mappings
    const categoryExamples = {
      'Legal Services': ['lawyer', 'attorney', 'law firm', 'legal counsel', 'legal advice'],
      'Financial Services': ['bank', 'accounting', 'finance', 'mortgage', 'loan', 'credit union', 'financial advisor'],
      'Healthcare': ['doctor', 'dentist', 'medical', 'clinic', 'hospital', 'physician', 'health'],
      'Restaurant': ['restaurant', 'food', 'dining', 'eat', 'meal', 'cuisine'],
      'Coffee & Tea': ['coffee', 'cafe', 'espresso', 'tea', 'coffee shop'],
      'Bakery': ['bakery', 'bread', 'pastry', 'cake', 'dessert'],
      'Home Services': ['contractor', 'plumber', 'electrician', 'hvac', 'repair', 'home improvement'],
      'Real Estate': ['realtor', 'property', 'real estate', 'housing', 'homes for sale'],
      'Insurance': ['insurance', 'coverage', 'policy', 'insure'],
      'Technology': ['tech', 'software', 'IT', 'computer', 'digital', 'technology'],
      'Automotive': ['car', 'auto', 'mechanic', 'vehicle', 'repair', 'automotive'],
      'Retail': ['shop', 'store', 'boutique', 'shopping'],
      'Non-Profit': ['nonprofit', 'non-profit', 'charity', 'foundation', 'volunteer']
    }

    const ragContext = Object.entries(categoryExamples)
      .map(([cat, keywords]) => `${cat}: ${keywords.join(', ')}`)
      .join('\n')

    // Use low-cost OpenRouter model with RAG
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free', // Low-cost free model
        messages: [
          {
            role: 'system',
            content: `You are a RAG-based semantic search assistant for a Central New York business directory. Match user queries to business categories using the context provided.

AVAILABLE CATEGORIES AND KEYWORDS (RAG Context):
${ragContext}

ALL CATEGORIES: ${AVAILABLE_CATEGORIES.join(', ')}

DESIGNATIONS:
- veteran_owned: veteran business, vet owned, military veteran
- woman_owned: woman owned, female owned, women owned
- minority_owned: minority owned, diverse owned
- is_nonprofit: nonprofit, non-profit, charity, foundation

TASK: Analyze the query and return ONLY valid JSON:
{
  "categories": ["exact_category_name"],
  "designations": ["designation"],
  "intent": "brief intent",
  "confidence": 0.9
}

RULES:
1. Match query keywords to category keywords using RAG context
2. Return EXACT category names from the list (case-sensitive)
3. Multiple categories OK if query is broad
4. Extract designations from query
5. Return ONLY JSON, no explanation`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1, // Lower for more deterministic matching
        max_tokens: 300
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status)
      const fallbackResult = performFallbackMatching(query)
      return NextResponse.json(fallbackResult)
    }

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content

    if (!aiResponse) {
      const fallbackResult = performFallbackMatching(query)
      return NextResponse.json(fallbackResult)
    }

    // Parse the AI response
    try {
      const result = JSON.parse(aiResponse) as SemanticSearchResult
      
      // Validate the result
      if (!Array.isArray(result.categories) || !Array.isArray(result.designations)) {
        throw new Error('Invalid response format')
      }

      // Filter to only valid categories
      result.categories = result.categories.filter(cat => 
        AVAILABLE_CATEGORIES.includes(cat)
      )

      // Filter to only valid designations
      result.designations = result.designations.filter(des => 
        AVAILABLE_DESIGNATIONS.includes(des)
      )

      return NextResponse.json(result)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      const fallbackResult = performFallbackMatching(query)
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    )
  }
}

// Enhanced fallback keyword-based matching with RAG-like logic
function performFallbackMatching(query: string): SemanticSearchResult {
  const lowerQuery = query.toLowerCase()
  const categories: string[] = []
  const designations: string[] = []

  // Comprehensive keyword-to-category mapping (RAG fallback)
  const keywordMap: Record<string, string[]> = {
    'lawyer|attorney|legal|law firm': ['Legal Services'],
    'bank|accounting|finance|mortgage|loan|credit union|financial': ['Financial Services'],
    'doctor|dentist|medical|clinic|hospital|physician|health care': ['Healthcare'],
    'restaurant|food|dining|eat|meal|cuisine': ['Restaurant'],
    'coffee|cafe|espresso|tea': ['Coffee & Tea'],
    'bakery|bread|pastry|cake|dessert': ['Bakery'],
    'contractor|plumber|electrician|hvac|repair|home improvement': ['Home Services'],
    'realtor|property|real estate|housing|homes': ['Real Estate'],
    'insurance|coverage|policy|insure': ['Insurance'],
    'tech|software|it|computer|digital': ['Technology'],
    'car|auto|mechanic|vehicle|automotive': ['Automotive'],
    'shop|store|boutique|shopping': ['Retail'],
    'hotel|motel|lodging|accommodation|stay': ['Lodging'],
    'nonprofit|non-profit|charity|foundation|homeless|community help': ['Non-Profit', 'Community Services'],
    'school|education|learning|university|college': ['Education'],
    'art|gallery|museum|theater|culture': ['Arts & Culture'],
    'manufacturing|factory|production|industrial': ['Manufacturing'],
    'engineering|engineer|design': ['Engineering'],
    'transportation|transit|bus|taxi|ride': ['Transportation'],
    'farm|agriculture|farming|crop': ['Agriculture'],
    'utility|utilities|energy|power|gas|electric': ['Energy & Utilities'],
    'government|city|county|municipal|public': ['Government'],
    'media|news|publishing|magazine|newspaper': ['Media & Publishing'],
    'event|wedding|catering|banquet': ['Event Services'],
    'photography|photo|video|videography': ['Photography & Video'],
    'marketing|advertising|promotion|ad': ['Marketing & Advertising'],
    'security|guard|protection|safety': ['Security Services'],
    'salon|spa|beauty|hair|nails': ['Beauty & Spa'],
    'pet|animal|veterinary|vet': ['Animal Welfare']
  }

  // Match keywords to categories
  for (const [keywords, cats] of Object.entries(keywordMap)) {
    const patterns = keywords.split('|')
    if (patterns.some(pattern => lowerQuery.includes(pattern))) {
      categories.push(...cats)
    }
  }

  // Remove duplicates
  const uniqueCategories = Array.from(new Set(categories))

  // Designation matching
  if (lowerQuery.match(/veteran|vet[\s-]owned|military/)) {
    designations.push('veteran_owned')
  }
  if (lowerQuery.match(/woman[\s-]owned|women[\s-]owned|female[\s-]owned/)) {
    designations.push('woman_owned')
  }
  if (lowerQuery.match(/minority[\s-]owned|diverse[\s-]owned/)) {
    designations.push('minority_owned')
  }
  if (lowerQuery.match(/nonprofit|non[\s-]profit/)) {
    designations.push('is_nonprofit')
  }

  return {
    categories: uniqueCategories,
    designations,
    intent: query,
    confidence: uniqueCategories.length > 0 || designations.length > 0 ? 0.8 : 0.3
  }
}
