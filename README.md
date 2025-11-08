# Chamber of Commerce Biz Concierge

A modern business directory application featuring an interactive map, AI-powered chatbot, and comprehensive business listings for the Central New York Chamber of Commerce.

## Features

- � **AI-Powered Semantic Search**: Natural language search landing page that understands queries like "veteran owned restaurant" or "nonprofit helping homeless"
- �🗺️ **Interactive Map**: Powered by Mapbox GL JS showing business locations
- 🤖 **AI Business Concierge**: OpenAI-powered chatbot for business inquiries
- 🏢 **Business Directory**: Comprehensive listings with ratings, contact info, and details
- ⭐ **Featured Businesses**: Highlighted sponsored and featured business listings
- 🎯 **Smart Filtering**: Automatically filters by categories and designations (veteran-owned, woman-owned, minority-owned, nonprofit)
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **AI Chat**: OpenAI API integration
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Mapbox account and access token
- Supabase project
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase database**:
   
   Create the following tables in your Supabase project:

   ```sql
   -- Businesses table
   CREATE TABLE businesses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     category VARCHAR(100) NOT NULL,
     description TEXT,
     address TEXT NOT NULL,
     phone VARCHAR(20),
     website VARCHAR(255),
     rating DECIMAL(2,1) DEFAULT 0,
     featured BOOLEAN DEFAULT false,
     sponsored BOOLEAN DEFAULT false,
     veteran_owned BOOLEAN DEFAULT false,
     latitude DECIMAL(10,8) NOT NULL,
     longitude DECIMAL(11,8) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Categories table
   CREATE TABLE categories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(100) NOT NULL UNIQUE,
     icon VARCHAR(50),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Reviews table
   CREATE TABLE reviews (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
     comment TEXT,
     author VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Insert sample data**:
   ```sql
   INSERT INTO businesses (name, category, description, address, phone, website, rating, featured, sponsored, veteran_owned, latitude, longitude) VALUES
   ('New York Sash', 'Home Services', 'Central New York''s premier window and door installation company. Expert installation, energy-efficient solutions, and exceptional customer service.', '1662 Sunset Ave, Utica, NY', '(315) 624-3420', 'newyorksash.com', 4.8, true, true, true, 43.1009, -75.2321),
   ('Utica Coffee Roasting Co', 'Coffee & Tea', 'Locally roasted coffee beans and specialty drinks in the heart of Utica.', 'Utica, NY', '(315) 624-2970', 'uticacoffee.com', 4.5, false, true, false, 43.1009, -75.2321),
   ('The Tailor and the Cook', 'Restaurant', 'Fine dining restaurant featuring locally sourced ingredients and creative cuisine.', 'Utica, NY', '(315) 507-8797', 'tailorandcook.com', 4.7, false, true, false, 43.1009, -75.2321),
   ('Aqua Vino', 'Restaurant', 'Italian-inspired restaurant with fresh pasta and extensive wine selection.', 'Utica, NY', '(315) 732-9284', 'aquavino.com', 4.6, false, true, false, 43.1009, -75.2321),
   ('Caruso''s Pastry Shoppe', 'Bakery', 'Traditional Italian bakery serving fresh pastries, cakes, and desserts since 1948.', 'Utica, NY', '(315) 732-9641', 'carusospastry.com', 4.9, false, true, false, 43.1009, -75.2321);
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Semantic Search Landing Page
- Visit the homepage to see the AI-powered search interface
- Enter natural language queries like:
  - "I need a lawyer"
  - "veteran owned restaurant"
  - "woman owned boutique"
  - "nonprofit helping homeless"
- The AI understands your intent and applies appropriate filters
- Get redirected to matching businesses automatically
- See [SEMANTIC_SEARCH.md](./SEMANTIC_SEARCH.md) for detailed documentation

### Business Directory
- Browse featured and regular business listings
- Search by business name, category, or description
- Filter by business category and designations (veteran-owned, woman-owned, nonprofit)
- View detailed business information including ratings, contact details, and descriptions

### Interactive Map
- View all businesses plotted on an interactive map
- Click markers to see business details in popups
- Featured businesses appear with special highlighted markers
- Zoom and pan to explore different areas

### AI Business Concierge
- Click the chat button to open the AI assistant
- Ask questions about local businesses, hours, directions, or services
- Get personalized business recommendations
- Natural language interaction for easy use

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Environment Variables for Production

Ensure all environment variables are set in your production environment:
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the Chamber of Commerce or open an issue in this repository.