# AI Rules & Tech Stack Guidelines

## 🏗️ Tech Stack Overview

• **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and React Server Components
• **Backend**: Supabase (PostgreSQL database with built-in auth and real-time subscriptions)
• **Maps**: Mapbox GL JS for interactive mapping and geocoding
• **AI/Chat**: OpenRouter API with GPT-4o-mini for business concierge functionality
• **UI Components**: shadcn/ui components with Radix UI primitives
• **Styling**: Tailwind CSS with custom design system and responsive utilities
• **Deployment**: Vercel with automatic CI/CD and environment management
• **Authentication**: Supabase Auth with session management and user roles
• **Data Management**: Supabase client for database operations and real-time updates
• **API Layer**: Next.js API routes with Supabase integration

## 🤖 AI Implementation Rules

### Core Principles
1. **Data Integrity First**: AI must only use actual business data from our database
2. **No Hallucinations**: Never invent or suggest businesses not in our directory
3. **Transparency**: Clearly indicate when showing business information from database
4. **User Control**: Always allow users to verify and correct AI suggestions

### Response Guidelines
1. **Format Consistently**: Use structured responses with clear business names, contact info, and ratings
2. **Include Map Actions**: When appropriate, mention business names to trigger map focus
3. **Handle Fallbacks**: Provide helpful responses even when AI is unavailable
4. **Stay Local**: Keep all recommendations focused on Central New York businesses

### Map Integration Protocol
1. **Business Mentions**: When a business name is mentioned in context of location, trigger map focus
2. **Explicit Requests**: Honor direct "show on map" or "where is" requests
3. **Location Context**: Use coordinates from database for accurate placement
4. **Visual Feedback**: Provide clear indication when map is being updated

## 📚 Library Usage Rules

### Maps & Geolocation
- **Primary**: Mapbox GL JS for all mapping functionality
- **Geocoding**: Mapbox Geocoding API only
- **Restrictions**: No Google Maps, Leaflet, or alternative mapping libraries

### UI Components
- **Primary**: shadcn/ui components for all interface elements
- **Icons**: Lucide React icons exclusively
- **Forms**: React Hook Form with Zod validation
- **Restrictions**: No Material UI, Ant Design, or other component libraries

### Data Management
- **Primary**: Supabase client for database operations
- **Real-time**: Supabase Realtime for live updates
- **Auth**: Supabase Auth for user management
- **Restrictions**: No direct PostgreSQL connections or alternative ORMs

### AI & API Integration
- **Primary**: OpenRouter API with GPT-4o-mini model
- **Fallbacks**: Predefined responses for offline scenarios
- **Rate Limiting**: Implement proper request throttling
- **Restrictions**: No direct OpenAI, Anthropic, or other AI service usage

### Styling & Design
- **Primary**: Tailwind CSS with custom configuration
- **Utilities**: clsx/tailwind-merge for conditional styling
- **Animations**: Framer Motion for complex animations only
- **Restrictions**: No styled-components, Emotion, or CSS-in-JS

### Authentication & Security
- **Primary**: Supabase Auth with cookie-based sessions
- **Protection**: Next.js middleware for route protection
- **Validation**: Zod for all input validation
- **Restrictions**: No custom auth implementations or third-party auth providers

### File Handling & Media
- **Storage**: Supabase Storage for all file operations
- **Uploads**: Custom upload components with progress tracking
- **Formats**: Strict MIME type validation
- **Restrictions**: No direct file system access or third-party storage

### Error Handling & Monitoring
- **Logging**: Consistent console.error for debugging
- **User Feedback**: Toast notifications for user-facing errors
- **Error Boundaries**: React error boundaries for component isolation
- **Restrictions**: No external error tracking without explicit configuration

## ⚠️ Prohibited Practices

1. **No External Data Sources**: Do not fetch data from third-party APIs without approval
2. **No Client-Side Secrets**: Never expose API keys or credentials in client code
3. **No Direct DOM Manipulation**: Use React state and refs only
4. **No Inline Styles**: Use Tailwind classes exclusively
5. **No Duplicate Components**: Reuse existing shadcn/ui components
6. **No Unapproved Dependencies**: Install only pre-approved packages
7. **No Inconsistent Styling**: Follow established Tailwind patterns
8. **No Bypassing Types**: Always use TypeScript interfaces and types

## ✅ Best Practices

1. **Component Structure**: Small, focused components with single responsibilities
2. **Data Flow**: Server components for data fetching, client components for interactivity
3. **Performance**: Code splitting and lazy loading where appropriate
4. **Accessibility**: ARIA labels and keyboard navigation support
5. **Testing**: Unit tests for utility functions and critical components
6. **Documentation**: Clear prop interfaces and component descriptions
7. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
8. **Error Resilience**: Graceful degradation when services are unavailable

## 🔄 Update Protocol

1. **AI Model Changes**: Review all prompt engineering and response handling
2. **Library Updates**: Check for breaking changes in component APIs
3. **Supabase Schema Changes**: Update TypeScript interfaces and validation
4. **Design System Updates**: Modify Tailwind configuration and component variants
5. **Security Patches**: Update auth flows and data validation immediately

---
*Last Updated: November 5, 2025*
*For questions or exceptions, contact the lead developer*