# Semantic Search Feature

## Overview
The Chamber of Commerce application now features an AI-powered semantic search landing page that allows users to find businesses using natural language queries.

## Features

### 🤖 AI-Powered Search
- Natural language understanding using OpenRouter API
- Semantic matching to business categories and designations
- Fallback keyword-based matching when AI is unavailable

### 🎯 Smart Filtering
- Automatically maps queries to relevant business categories
- Recognizes business designations (veteran-owned, woman-owned, minority-owned, nonprofit)
- Applies multiple filters simultaneously

### 🎨 Modern Landing Page
- ChatGPT-style interface
- Example queries for easy discovery
- Responsive design with beautiful animations
- Direct navigation to filtered results

## How It Works

### User Flow
1. User visits the root page (`/`)
2. Landing page displays with semantic search interface
3. User enters a natural language query (e.g., "veteran owned restaurant")
4. System uses AI to understand intent and match to:
   - Business categories (Restaurant, Professional Services, etc.)
   - Business designations (veteran_owned, woman_owned, etc.)
5. User is redirected to main app with filters applied
6. Map and list show only matching businesses

### API Endpoint
**POST** `/api/semantic-search`

Request:
```json
{
  "query": "I need a lawyer"
}
```

Response:
```json
{
  "categories": ["Professional Services"],
  "designations": [],
  "intent": "User is looking for legal services",
  "location": null,
  "confidence": 0.85
}
```

## Available Categories
- Home Services
- Restaurant
- Coffee & Tea
- Bakery
- Retail
- Professional Services
- Health & Wellness
- Automotive
- Entertainment
- Beauty & Spa
- Non-Profit
- Education
- Community Services
- Arts & Culture
- Animal Welfare
- Youth Services
- Senior Services
- Emergency Services
- Religious Organizations
- Sports & Recreation

## Available Designations
- `veteran_owned` - Veteran-owned businesses
- `woman_owned` - Woman-owned businesses
- `minority_owned` - Minority-owned businesses
- `is_nonprofit` - Nonprofit organizations

## Example Queries
- "I need a lawyer"
- "veteran owned restaurant"
- "woman owned boutique near me"
- "where can I get my car fixed"
- "nonprofit helping homeless"
- "find a dentist"
- "local coffee shop"
- "minority owned business"

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try the example queries or create your own
4. Verify correct categories and designations are applied

### Automated Testing
Run the test script:
```bash
node test-semantic-search.js
```

This will test all example queries and display the results.

## Configuration

### Environment Variables
The semantic search uses the existing OpenRouter API configuration:

```env
OPENAI_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Fallback Mode
If the API key is not configured or the API is unavailable, the system automatically falls back to keyword-based matching. This ensures the feature works even without AI.

## Implementation Details

### Files Created/Modified
1. **`src/app/api/semantic-search/route.ts`** - API endpoint for semantic search
2. **`src/app/landing/page.tsx`** - Landing page component with search interface
3. **`src/app/page.tsx`** - Modified to show landing page and handle URL parameters
4. **`test-semantic-search.js`** - Test script for validating the API

### URL Parameters
The landing page redirects to the main app with these parameters:
- `categories` - Comma-separated list of matched categories
- `designations` - Comma-separated list of matched designations
- `q` - Original search query

Example: `/?categories=Restaurant&designations=veteran_owned&q=veteran%20owned%20restaurant`

## Future Enhancements
- Add location-based filtering
- Support for multiple simultaneous categories
- Save recent searches
- Popular searches analytics
- Voice search capability
- Multi-language support

## Troubleshooting

### Issue: API returns empty results
**Solution**: Check that your OPENAI_API_KEY is properly set in `.env.local`. The system will fall back to keyword matching if the API fails.

### Issue: Landing page doesn't show
**Solution**: Clear any URL parameters by navigating directly to `/`. The landing page only shows when there are no search parameters.

### Issue: Filters not applied correctly
**Solution**: Check browser console for any errors. Verify that the business data includes the required fields (category, veteran_owned, is_nonprofit).

## Support
For issues or questions, please check the main README or contact the development team.
