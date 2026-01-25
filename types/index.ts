export type AvailabilityStatus = 'Available' | 'On Leave';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
export type ServiceDuration = 15 | 30 | 60;

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  image_url: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile | null;
}

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

export interface AppointmentWithDetails extends Appointment {
  service: Service;
  staff: Staff | null;
}

export interface StaffWithLoad extends Staff {
  appointments_today: number;
}