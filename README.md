# Smart Appointment & Queue Manager

A comprehensive web application to manage service appointments, staff availability, and customer queues with intelligent conflict detection and queue management.

## 🚀 Demo Account

Try the app instantly with our demo account:

| Field | Value |
|-------|-------|
| **Email** | `demo@example.com` |
| **Password** | `d#1aEdmO(` |

> 💡 Click the **ℹ️ info icon** on the login page to view credentials and app features.
> 
> Or simply click **"Try Demo Account"** button to login automatically.

## 🌟 Features

### Authentication & User Management
- ✅ Email/password authentication with Supabase
- ✅ User profile management (name, image, address, phone)
- ✅ Profile image upload to Supabase Storage
- ✅ Persistent sessions across page reloads
- ✅ Demo account for quick testing

### Staff Management
- ✅ Create and manage staff members
- ✅ Track service types and availability status
- ✅ Daily capacity limits (max appointments per day)
- ✅ Staff load visualization

### Service Management
- ✅ Define services with customizable durations (15/30/60 minutes)
- ✅ Assign required staff types for each service
- ✅ Full CRUD operations

### Appointment Management
- ✅ Create appointments with customer details
- ✅ Smart staff assignment based on availability
- ✅ Conflict detection for overlapping appointments
- ✅ Status tracking (Scheduled, Completed, Cancelled, No-Show)
- ✅ Edit and delete appointments

### Queue Management
- ✅ Automatic queue for appointments without available staff
- ✅ Queue position tracking
- ✅ Manual staff assignment from queue
- ✅ Priority-based assignment (earliest appointments first)

### Dashboard
- ✅ Real-time statistics (total, completed, pending appointments)
- ✅ Staff load summary
- ✅ Activity log with recent actions
- ✅ Quick access to all features

### Real-time Updates
- ✅ Live appointment updates across all pages
- ✅ Instant queue position changes
- ✅ Real-time activity log
- ✅ Supabase Realtime integration

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (profile images)
- **Realtime**: Supabase Realtime (live updates)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd queue-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Configure environment variables
- Run the database schema
- Set up storage bucket
- Enable Realtime

4. **Configure environment variables**

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Create demo user in Supabase**

Go to Supabase Dashboard → Authentication → Users → Add User:
- Email: `demo@example.com`
- Password: `d#1aEdmO(`
- Check "Auto Confirm User"

6. **Run the development server**
```bash
npm run dev
```

7. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Business Logic

### Appointment Assignment Rules

1. **Staff Availability Check**:
   - Shows each eligible staff member with current capacity (e.g., "Farhan (3/5 appointments today)")
   - Warns if staff exceeds daily capacity
   - If no staff available, appointment goes to waiting queue

2. **Conflict Detection**:
   - Checks for time conflicts when creating/editing appointments
   - Shows warning: "This staff member already has an appointment at this time"
   - Offers options to pick another staff or change time

3. **Queue Management**:
   - Appointments without staff enter the waiting queue
   - Ordered by appointment time
   - Shows queue position (1st, 2nd, 3rd...)
   - Manual assignment from queue to available staff

### Data Persistence

- ✅ **All data stored in Supabase**
- ✅ **Sessions persist across hard reloads** - you stay signed in
- ✅ **Data survives browser close** - all appointments, staff, services remain
- ✅ **Activity logs** track all important actions

### Security

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only access their own data
- ✅ **Middleware protection** for all dashboard routes
- ✅ **Session-based authentication** with automatic renewal

## 📁 Project Structure

```
queue-manager/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/            # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── queue/
│   │   ├── staff/
│   │   ├── services/
│   │   └── profile/
│   └── layout.tsx
├── components/
│   ├── layout/                 # Navbar, Sidebar
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── supabase/               # Supabase client & queries
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── queries.ts
│   │   ├── database.types.ts
│   │   └── schema.sql
│   ├── storage/                # (Legacy localStorage - not used)
│   └── utils/                  # Utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
├── proxy.ts                    # Route protection / proxy middleware
└── .env.local                  # Environment variables (not in git)
```

## 🧪 Testing

### Test Session Persistence:
1. Create account and add data
2. Hard reload (Ctrl/Cmd + Shift + R)
3. ✅ Verify you're still logged in
4. ✅ Verify all data remains

### Test Profile Updates:
1. Update profile information
2. Upload profile image
3. Close and reopen browser
4. ✅ Verify changes persisted

## 🐛 Troubleshooting

See [SUPABASE_SETUP.md - Troubleshooting](./SUPABASE_SETUP.md#-troubleshooting) section

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using Next.js and Supabase**
