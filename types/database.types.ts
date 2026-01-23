// types/database.types.ts
export type AvailabilityStatus = 'Available' | 'On Leave';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
export type ServiceDuration = 15 | 30 | 60;

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  service_type: string;
  daily_capacity: number;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  duration: ServiceDuration;
  required_staff_type: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  customer_name: string;
  service_id: string;
  staff_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  in_queue: boolean;
  queue_position: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  appointment_id: string | null;
  created_at: string;
}

// Extended types with relations
export interface AppointmentWithDetails extends Appointment {
  service: Service;
  staff: Staff | null;
}

export interface StaffWithLoad extends Staff {
  appointments_today: number;
}
```

---

## 5. Frontend Structure (Next.js App Router)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Protected layout
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Main dashboard
│   │   ├── appointments/
│   │   │   ├── page.tsx               # Appointments list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create appointment
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit appointment
│   │   ├── staff/
│   │   │   ├── page.tsx               # Staff list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create staff
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit staff
│   │   ├── services/
│   │   │   ├── page.tsx               # Services list
│   │   │   ├── new/
│   │   │   │   └── page.tsx           # Create service
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit service
│   │   └── queue/
│   │       └── page.tsx               # Waiting queue management
│   ├── layout.tsx
│   └── page.tsx                       # Landing/redirect
├── components/
│   ├── ui/                            # Reusable animated components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── AnimatedBackground.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── StaffLoadCard.tsx
│   │   └── ActivityLogList.tsx
│   ├── appointments/
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentForm.tsx
│   │   ├── StaffSelector.tsx
│   │   └── ConflictWarning.tsx
│   ├── queue/
│   │   ├── QueueList.tsx
│   │   └── AssignFromQueueButton.tsx
│   └── providers/
│       ├── SupabaseProvider.tsx
│       └── ToastProvider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser client
│   │   ├── server.ts                  # Server client
│   │   └── middleware.ts              # Auth middleware
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAppointments.ts
│   │   ├── useStaff.ts
│   │   ├── useServices.ts
│   │   └── useActivityLogs.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── conflictDetection.ts
│   │   ├── queueManager.ts
│   │   └── validators.ts
│   └── constants.ts
├── types/
│   ├── database.types.ts
│   └── api.types.ts
└── styles/
    └── globals.css