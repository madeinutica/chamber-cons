# Semantic Search Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER VISITS HOMEPAGE                        │
│                    http://localhost:3000                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Has URL Params? │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   NO                YES
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Show Landing     │  │  Show Main App   │
         │  Page with        │  │  with Filters    │
         │  Search Interface │  │  Applied         │
         └──────────────────┘  └──────────────────┘
                    │
                    │ User enters query
                    ▼
         ┌──────────────────────┐
         │  "veteran owned      │
         │   restaurant"        │
         └──────────────────────┘
                    │
                    ▼
         ┌─────────────────────────────────────┐
         │  POST /api/semantic-search          │
         │  {                                   │
         │    "query": "veteran owned restaurant" │
         │  }                                   │
         └──────────────┬──────────────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         Has API Key?        No API Key
              │                   │
             YES                  │
              │                   │
              ▼                   ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  OpenRouter AI   │  │  Fallback        │
    │  GPT-4o-mini     │  │  Keyword Match   │
    │                  │  │                  │
    │  Analyzes:       │  │  Checks:         │
    │  - Intent        │  │  - Keywords      │
    │  - Categories    │  │  - Patterns      │
    │  - Designations  │  │                  │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             └──────────┬──────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  Response:          │
              │  {                  │
              │    categories: [    │
              │      "Restaurant"   │
              │    ],               │
              │    designations: [  │
              │      "veteran_owned"│
              │    ],               │
              │    confidence: 0.9  │
              │  }                  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │  Build URL Parameters:  │
              │                         │
              │  ?categories=Restaurant │
              │  &designations=veteran_ │
              │   owned                 │
              │  &q=veteran%20owned%20  │
              │   restaurant            │
              └──────────┬──────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │  Navigate to Main App   │
              │  with Filters Applied   │
              └──────────┬──────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │  Filter Business List:  │
              │                         │
              │  1. Filter by category  │
              │     (Restaurant)        │
              │                         │
              │  2. Filter by           │
              │     designation         │
              │     (veteran_owned)     │
              │                         │
              │  3. Apply to map & list │
              └──────────┬──────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │  Display Results:       │
              │                         │
              │  • Map shows markers    │
              │  • List shows businesses│
              │  • Only matches shown   │
              └─────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        src/app/page.tsx                          │
│                      (Main Entry Point)                          │
│                                                                  │
│  • Reads URL parameters                                         │
│  • Shows Landing or Main App                                    │
│  • Manages business filtering                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  src/app/landing/    │    │  Main App            │
│  page.tsx            │    │  Components          │
│                      │    │                      │
│  • Search interface  │    │  • BusinessMap       │
│  • Example queries   │    │  • BusinessList      │
│  • Calls API         │    │  • ChatBot           │
│  • Navigates         │    │  • Header            │
└──────────┬───────────┘    └──────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  src/app/api/semantic-search/        │
│  route.ts                            │
│                                      │
│  • Receives query                   │
│  • Calls OpenRouter API             │
│  • Fallback to keywords             │
│  • Returns categories/designations  │
└──────────────────────────────────────┘
```

## Data Flow

```
User Query
    ↓
"veteran owned restaurant"
    ↓
API Processing
    ↓
┌─────────────────────────────┐
│  AI Analysis                │
│                             │
│  Categories:                │
│  • Restaurant (matched)     │
│                             │
│  Designations:              │
│  • veteran_owned (matched)  │
│  • woman_owned (no match)   │
│  • minority_owned (no match)│
│  • is_nonprofit (no match)  │
│                             │
│  Confidence: 0.9            │
└─────────────────────────────┘
    ↓
URL Construction
    ↓
/?categories=Restaurant&designations=veteran_owned&q=veteran%20owned%20restaurant
    ↓
Filter Application
    ↓
┌─────────────────────────────┐
│  Business Filtering         │
│                             │
│  All businesses (552)       │
│  ↓                          │
│  Filter by category         │
│  → Restaurants (45)         │
│  ↓                          │
│  Filter by veteran_owned    │
│  → Results (12)             │
│                             │
│  Display on map and list    │
└─────────────────────────────┘
```

## Category Mapping Examples

```
Query                          → Categories               → Designations
─────────────────────────────────────────────────────────────────────────
"I need a lawyer"              → Professional Services    → []
"veteran restaurant"           → Restaurant               → [veteran_owned]
"woman owned boutique"         → Retail                   → [woman_owned]
"nonprofit helping animals"    → Animal Welfare           → [is_nonprofit]
"find a dentist"               → Health & Wellness        → []
"minority owned coffee shop"   → Coffee & Tea             → [minority_owned]
"where to get car fixed"       → Automotive               → []
"veteran nonprofit"            → Community Services       → [veteran_owned, is_nonprofit]
```

## API Request/Response Format

### Request
```json
POST /api/semantic-search
Content-Type: application/json

{
  "query": "veteran owned restaurant"
}
```

### Response (Success)
```json
{
  "categories": ["Restaurant"],
  "designations": ["veteran_owned"],
  "intent": "User is looking for veteran-owned restaurants",
  "location": null,
  "confidence": 0.9
}
```

### Response (Fallback)
```json
{
  "categories": ["Restaurant"],
  "designations": ["veteran_owned"],
  "intent": "veteran owned restaurant",
  "confidence": 0.7
}
```

### Response (Error)
```json
{
  "error": "Failed to process search query"
}
```

## State Management

```
┌────────────────────────────────────┐
│  Main App State (src/app/page.tsx) │
├────────────────────────────────────┤
│  • businesses: Business[]          │
│  • filteredBusinesses: Business[]  │
│  • searchTerm: string              │
│  • selectedCategory: string        │
│  • selectedDesignations: string[]  │
│  • showLanding: boolean            │
└────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│  URL Parameters (via Next.js)      │
├────────────────────────────────────┤
│  • categories: string              │
│  • designations: string            │
│  • q: string                       │
└────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│  Filter Logic                       │
├────────────────────────────────────┤
│  1. Filter by search term          │
│  2. Filter by category             │
│  3. Filter by designations         │
│  4. Update filteredBusinesses      │
└────────────────────────────────────┘
```

## Technology Stack

```
┌──────────────────────────────────────┐
│  Frontend                            │
│  • Next.js 14 (App Router)          │
│  • React 18                          │
│  • TypeScript                        │
│  • Tailwind CSS                      │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Backend                             │
│  • Next.js API Routes                │
│  • OpenRouter API (GPT-4o-mini)     │
│  • Supabase (PostgreSQL)            │
└──────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  Deployment                          │
│  • Vercel                            │
│  • Environment Variables             │
│  • Edge Functions                    │
└──────────────────────────────────────┘
```

## Performance Characteristics

```
Landing Page Load:           < 100ms
───────────────────────────────────────
AI Search (with API):        1-2 sec
  • Network latency:         500ms
  • AI processing:           800ms
  • Response parsing:        < 50ms
───────────────────────────────────────
Fallback Search (no API):    < 100ms
  • Keyword matching:        < 50ms
  • Filter application:      < 50ms
───────────────────────────────────────
Filter Application:          < 50ms
Business List Render:        < 100ms
Map Update:                  < 200ms
```

## Error Handling Flow

```
                    ┌─────────────┐
                    │  API Call   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │             │
                 Success       Error
                    │             │
                    │             ▼
                    │      ┌──────────────┐
                    │      │ Log Error    │
                    │      └──────┬───────┘
                    │             │
                    │             ▼
                    │      ┌──────────────┐
                    │      │ Use Fallback │
                    │      │ Keyword      │
                    │      │ Matching     │
                    │      └──────┬───────┘
                    │             │
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Return Result│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Apply Filters│
                    └──────────────┘
```

This architecture ensures the semantic search is:
- ✅ Fast and responsive
- ✅ Reliable with fallbacks
- ✅ Easy to maintain
- ✅ Scalable for future features
