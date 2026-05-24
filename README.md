# ✨ Smart Appointment & Queue Manager

Modern queue + appointment management for service businesses.

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

## 🎯 What This App Solves

- Prevents staff double-booking with conflict checks
- Assigns available staff automatically where possible
- Places unassigned bookings into a smart waiting queue
- Gives live dashboard visibility for appointments, queue, and staff load

## 🔐 Demo Login

Use the **ℹ️ icon** on login page or click **Try Demo Account**.

## 🌈 Core Features

### 👤 Authentication & Profile
- Email/password login with Supabase Auth
- Persistent sessions after reload/browser restart
- Editable profile (name, phone, address, image)
- Profile image upload via Supabase Storage

### 🧑‍💼 Staff
- Add/edit/remove staff members
- Set service type and availability
- Daily appointment capacity per staff
- Staff load visibility for planning

### 🛠️ Services
- Create services with 15/30/60 min durations
- Define required staff type per service
- Full CRUD workflow

### 📅 Appointments
- Create and manage customer appointments
- Smart assignment to eligible staff
- Overlap conflict warning before save
- Status flow: Scheduled, Completed, Cancelled, No-Show

### 🕒 Queue
- Auto-queue when no suitable staff is free
- Queue ordered by appointment time
- Queue position tracking
- Manual assignment from queue to staff

### 📊 Dashboard & Realtime
- Live appointment counters (total/pending/completed)
- Recent activity log
- Staff load summary
- Instant updates using Supabase Realtime

## 🧠 Business Rules (Simple)

1. Try to assign an available eligible staff member.
2. If schedule conflict or no availability, place in queue.
3. Queue is prioritized by earliest appointment time.
4. Admin can manually assign queued items any time.

## 🧰 Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Tailwind CSS + Framer Motion + Lucide Icons

## ⚡ Quick Start

1. Install dependencies
```bash
npm install
```

2. Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Complete Supabase setup in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

4. Run the app
```bash
npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000)

## ✅ Security & Reliability

- Row Level Security (RLS) enabled
- User-isolated data access
- Session auto-renewal
- Protected dashboard routes via middleware

## 🧪 Quick Test Checklist

- Login → hard reload → still authenticated
- Create staff/service/appointment → data persists
- Book conflicting slot → warning appears
- Create without available staff → enters queue

## 📌 Notes

- Troubleshooting: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#-troubleshooting)
- License: MIT

---

Built with ❤️ using Next.js + Supabase
