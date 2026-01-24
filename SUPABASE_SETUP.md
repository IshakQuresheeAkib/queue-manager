# Queue Manager - Supabase Setup Guide

## 📋 Overview

This guide will help you set up Supabase for the Queue Manager application. All user data, appointments, staff, services, and activity logs are now stored in Supabase with complete session persistence across page reloads.

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in:
   - Project name: `queue-manager` (or your preferred name)
   - Database password: (create a strong password)
   - Region: (choose closest to you)
5. Wait for the project to be provisioned (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys" → "anon public")

### 3. Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit `.env.local` to version control!

### 4. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `lib/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl/Cmd + Enter)

This will create:
- ✅ All tables (profiles, staff, services, appointments, activity_logs)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps
- ✅ Auto-profile creation on user signup

### 5. Set Up Storage Bucket (for Profile Images)

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `profiles`
4. Set as **Public bucket** (check the box)
5. Click "Create"

#### Add Storage Policies via SQL Editor:

Run this SQL in the **SQL Editor** to set up storage policies:

```sql
-- Storage policies for profile images
-- Users can upload to their own folder (folder name = user_id)

-- INSERT policy
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE policy
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE policy
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT policy (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');
```

### 6. Enable Realtime (for Live Updates)

The app uses Supabase Realtime for live updates on the Dashboard and Queue pages.

1. In Supabase dashboard, go to **Database** → **Replication**
2. Under "Supabase Realtime", click **0 tables** (or "Manage")
3. Enable replication for these tables:
   - ✅ `appointments`
   - ✅ `staff`
   - ✅ `services`
   - ✅ `activity_logs`
4. Click "Save"

**Alternative: Using SQL Editor:**

```sql
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
```

### 7. Create Demo User (Optional)

For testing purposes, you can create a demo account:

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: `demo@example.com`
   - Password: `d#1aEdmO(`
   - ✅ Check "Auto Confirm User"
4. Click "Create user"

Now anyone can try the app using the demo credentials shown on the login page.

### 8. Install Dependencies & Run

```bash
npm install
npm run dev
```

Your app should now be running at `http://localhost:3000`

## ✨ Features Implemented

### 🔐 Authentication
- ✅ Signup with email/password stored in Supabase Auth
- ✅ Login with persistent session (survives hard reload)
- ✅ Demo account functionality (demo@example.com / d#1aEdmO()
- ✅ Automatic logout on session expiry
- ✅ Protected routes with middleware

### 🔄 Realtime Updates
- ✅ Live appointment updates on Dashboard & Queue
- ✅ Staff availability changes reflected instantly
- ✅ Activity logs update in real-time
- ✅ No page refresh needed for latest data

### 👤 User Profile
- ✅ Profile creation (auto-created on signup)
- ✅ Update name, phone, address
- ✅ Upload profile image to Supabase Storage
- ✅ View profile in navbar with avatar
- ✅ All changes persist across reloads

### 👥 Staff Management
- ✅ Create, read, update, delete staff
- ✅ Track availability status
- ✅ Daily capacity tracking
- ✅ All data persists in Supabase

### 🛠️ Services Management
- ✅ Create, read, update, delete services
- ✅ Define duration (15/30/60 min)
- ✅ Specify required staff type
- ✅ All data persists in Supabase

### 📅 Appointments
- ✅ Create appointments with validation
- ✅ Conflict detection
- ✅ Auto-assignment logic
- ✅ Status tracking (Scheduled/Completed/Cancelled/No-Show)
- ✅ Queue management for unassigned appointments
- ✅ All data persists in Supabase

### 📊 Dashboard
- ✅ Real-time statistics
- ✅ Staff load summary
- ✅ Activity logs
- ✅ All data fetched from Supabase

### 🔄 Data Persistence
- ✅ All data stored in Supabase (not localStorage)
- ✅ Session maintained across hard reloads
- ✅ User stays signed in when closing/reopening tabs
- ✅ All CRUD operations sync with database

## 🛠️ Technical Details

### Database Tables

```
profiles         - User profile information
├─ id (PK)
├─ user_id (FK → auth.users)
├─ name, image_url, address, phone
└─ created_at, updated_at

staff           - Staff members
├─ id (PK)
├─ user_id (FK → auth.users)
├─ name, service_type
├─ daily_capacity, availability_status
└─ created_at, updated_at

services        - Available services
├─ id (PK)
├─ user_id (FK → auth.users)
├─ name, duration, required_staff_type
└─ created_at, updated_at

appointments    - Appointments & queue
├─ id (PK)
├─ user_id (FK → auth.users)
├─ customer_name
├─ service_id (FK → services)
├─ staff_id (FK → staff, nullable)
├─ appointment_date, appointment_time
├─ status, in_queue, queue_position
└─ created_at, updated_at

activity_logs   - Activity tracking
├─ id (PK)
├─ user_id (FK → auth.users)
├─ action_type, description
├─ appointment_id (FK → appointments, nullable)
└─ created_at
```

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see/modify their own data
- Enforced at database level for security
- No user can access another user's data

### TypeScript Types

All types are strictly typed in `types/index.ts` and `lib/supabase/database.types.ts`:
- ❌ No `any` types used anywhere
- ✅ Full type safety throughout the app
- ✅ IntelliSense support for all queries

## 🧪 Testing

### Test Hard Reload Functionality:

1. **Sign up** a new account
2. **Create** some staff, services, and appointments
3. **Update your profile** with name, image, address
4. **Hard reload** the page (Ctrl/Cmd + Shift + R)
5. ✅ Verify you're still logged in
6. ✅ Verify all your data is still there
7. **Close the tab** completely
8. **Open a new tab** and go to the app
9. ✅ Verify you're still logged in (session persisted)

### Test Profile Updates:

1. Go to **Profile** page
2. Update name, phone, address
3. Upload a profile image
4. **Hard reload**
5. ✅ Verify changes are saved
6. ✅ Verify image appears in navbar

### Test Data Persistence:

1. Create appointments, staff, services
2. **Close browser** completely
3. **Reopen browser** and navigate to app
4. ✅ Verify you're auto-logged in
5. ✅ Verify all data is present

## 🚨 Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Restart the dev server after changing env variables

### "Row Level Security policy violation"
- Ensure you ran the entire `schema.sql` script
- Check that RLS policies were created in Supabase dashboard
- Verify you're logged in (auth.uid() should exist)

### Data not persisting
- Check browser console for errors
- Verify database connection in Supabase dashboard
- Check that tables were created successfully

### Session not persisting
- Clear browser cookies and try again
- Check that middleware.ts is running
- Verify Supabase Auth is configured correctly

### Image upload fails
- Verify `profiles` storage bucket exists
- Check storage policies are set correctly
- Ensure bucket is set to "public"

## 📚 Files Reference

### Core Supabase Files
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/database.types.ts` - TypeScript database types
- `lib/supabase/queries.ts` - All database query functions
- `lib/supabase/realtime.ts` - Realtime subscription hooks
- `lib/supabase/schema.sql` - Database schema SQL

### Authentication
- `components/ui/AuthContext.tsx` - Auth state management
- `middleware.ts` - Route protection & session management

### Pages
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `app/(dashboard)/profile/page.tsx` - Profile management
- `app/(dashboard)/dashboard/page.tsx` - Dashboard
- `app/(dashboard)/staff/page.tsx` - Staff management
- `app/(dashboard)/services/page.tsx` - Services management
- `app/(dashboard)/appointments/page.tsx` - Appointments list
- `app/(dashboard)/queue/page.tsx` - Queue management

## 🎯 Next Steps

After setup is complete, you can:

1. **Deploy to Vercel/Netlify**:
   - Add environment variables in hosting platform
   - Deploy directly from GitHub

2. **Enable Email Confirmations**:
   - Go to Supabase Auth settings
   - Configure email templates
   - Enable email confirmation

3. **Configure Session Expiry** (Optional):
   - Go to Supabase **Authentication** → **Settings**
   - Under "Sessions", configure:
     - JWT expiry time (default: 3600 seconds / 1 hour)
     - Refresh token rotation
   - For longer sessions, increase JWT expiry (e.g., 86400 for 24 hours)

4. **Add More Features**:
   - Email notifications for appointments
   - Calendar integrations (Google Calendar, Outlook)
   - Analytics dashboard with charts
   - SMS reminders via Twilio

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard for errors
2. Review browser console logs
3. Verify all environment variables are set
4. Ensure schema.sql ran successfully