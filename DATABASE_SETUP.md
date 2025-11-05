# Database Setup Guide

## 🚨 IMPORTANT: Create Database Tables First

The social network features require database tables that need to be created manually in Supabase.

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor tab
3. Create a new query

### Step 2: Run the SQL Script
Copy and paste the entire contents of `scripts/create-social-tables.sql` into the SQL Editor and execute it.

This will create the following tables:
- `users` - User profiles and authentication
- `posts` - Community posts and content
- `comments` - Post comments and discussions
- `votes` - Upvote/downvote system
- `media_files` - File upload tracking
- `business_owners` - Business ownership relationships

### Step 3: Set Up Supabase Storage (For Media Uploads)
1. In Supabase dashboard, go to Storage
2. Create a new bucket called `media`
3. Make it public for file access
4. Set up policies for authenticated uploads

### Step 4: Verify Setup
Run `node scripts/check-database.js` to verify all tables are created successfully.

---

## Current Status
- ✅ Business directory functionality working
- ✅ Social network code implemented
- ⚠️  Database tables need manual creation
- 🔄 Ready to implement media upload system

## Next Steps
1. Create database tables (manual step above)
2. Set up Supabase Storage buckets
3. Implement media upload components
4. Connect media uploads to posts
5. Test full social network functionality

---

*After completing the database setup, the social network features will be fully functional!*