<!-- Chamber of Commerce Biz Concierge Project Instructions -->

## Project Overview
Chamber of Commerce Biz Concierge application with:
- Interactive map using Mapbox
- AI chatbot for business inquiries
- Comprehensive business listing information
- Built with Next.js, Supabase database, deployed on Vercel

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **AI Chat**: OpenAI API integration
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Key Features
- Interactive map showing business locations
- Business directory with filtering and search
- AI-powered business concierge chatbot
- Business details with ratings, contact info, and websites
- Featured/sponsored business highlighting
- Responsive design for all devices

## Database Schema
- businesses: id, name, category, description, address, phone, website, rating, featured, coordinates
- categories: id, name, icon
- reviews: id, business_id, rating, comment, created_at

## Development Guidelines
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Follow Next.js 14 app router conventions
- Use Supabase client for database operations
- Integrate Mapbox for interactive mapping
- Implement proper error handling and loading states