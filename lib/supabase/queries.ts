import { createClient } from './client';
import type { Database } from './database.types';
import type { 
  Staff, 
  Service, 
  Appointment, 
  ActivityLog, 
  UserProfile,
  StaffWithLoad,
  AppointmentWithDetails 
} from '@/types';

// Type helpers for database operations
type Tables = Database['public']['Tables'];
type ProfileInsert = Tables['profiles']['Insert'];
type ProfileUpdate = Tables['profiles']['Update'];
type StaffInsert = Tables['staff']['Insert'];
type StaffUpdate = Tables['staff']['Update'];
type ServiceInsert = Tables['services']['Insert'];
type ServiceUpdate = Tables['services']['Update'];
type AppointmentInsert = Tables['appointments']['Insert'];
type AppointmentUpdate = Tables['appointments']['Update'];
type ActivityLogInsert = Tables['activity_logs']['Insert'];

// Profile queries
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as ProfileUpdate)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as UserProfile;
}

export async function upsertProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile as ProfileInsert)
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data as UserProfile;
}

// Staff queries
export async function getStaff(userId: string): Promise<Staff[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff:', error);
    return [];
  }

  return data as Staff[];
}

// Get unique service types from staff for suggestions
export async function getUniqueStaffTypes(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('service_type')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching staff types:', error);
    return [];
  }

  // Extract unique types
  const types = new Set(data?.map((s) => s.service_type) || []);
  return Array.from(types).sort();
}

// Get unique required staff types from services for suggestions
export async function getUniqueServiceStaffTypes(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .select('required_staff_type')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching service staff types:', error);
    return [];
  }

  // Extract unique types
  const types = new Set(data?.map((s) => s.required_staff_type) || []);
  return Array.from(types).sort();
}

// Get all unique staff/service types combined (for suggestions)
export async function getAllUniqueTypes(userId: string): Promise<string[]> {
  const [staffTypes, serviceTypes] = await Promise.all([
    getUniqueStaffTypes(userId),
    getUniqueServiceStaffTypes(userId),
  ]);

  const combined = new Set([...staffTypes, ...serviceTypes]);
  return Array.from(combined).sort();
}

export async function addStaff(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('staff')
    .insert(staff as StaffInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding staff:', error);
    return null;
  }

  return data as Staff;
}

export async function updateStaff(id: string, updates: Partial<Omit<Staff, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Staff | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('staff')
    .update(updates as StaffUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating staff:', error);
    return null;
  }

  return data as Staff;
}

export async function deleteStaff(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff:', error);
    return false;
  }

  return true;
}

// Service queries
export async function getServices(userId: string): Promise<Service[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data as Service[];
}

export async function addService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .insert(service as ServiceInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding service:', error);
    return null;
  }

  return data as Service;
}

export async function updateService(id: string, updates: Partial<Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Service | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('services')
    .update(updates as ServiceUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    return null;
  }

  return data as Service;
}

export async function deleteService(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }

  return true;
}

// Appointment queries
export async function getAppointments(userId: string): Promise<Appointment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }

  return data as Appointment[];
}

export async function getAppointmentsWithDetails(userId: string): Promise<AppointmentWithDetails[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      staff:staff(*)
    `)
    .eq('user_id', userId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) {
    console.error('Error fetching appointments with details:', error);
    return [];
  }

  return data as unknown as AppointmentWithDetails[];
}

export async function addAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment as AppointmentInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding appointment:', error);
    return null;
  }

  return data as Appointment;
}

export async function updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Appointment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('appointments')
    .update(updates as AppointmentUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    return null;
  }

  return data as Appointment;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }

  return true;
}

// Activity log queries
export async function getActivityLogs(userId: string, limit: number = 10): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data as ActivityLog[];
}

export async function addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log as ActivityLogInsert)
    .select()
    .single();

  if (error) {
    console.error('Error adding activity log:', error);
    return null;
  }

  return data as ActivityLog;
}

// Helper function to get staff with load
export async function getStaffWithLoad(userId: string, date: string): Promise<StaffWithLoad[]> {
  const supabase = createClient();
  
  const [staffResult, appointmentsResult] = await Promise.all([
    supabase.from('staff').select('*').eq('user_id', userId),
    supabase
      .from('appointments')
      .select('staff_id')
      .eq('user_id', userId)
      .eq('appointment_date', date)
      .neq('status', 'Cancelled')
  ]);

  if (staffResult.error || appointmentsResult.error) {
    console.error('Error fetching staff with load:', staffResult.error || appointmentsResult.error);
    return [];
  }

  const staff = staffResult.data as Staff[];
  const appointments = appointmentsResult.data as { staff_id: string | null }[];

  return staff.map((s) => ({
    ...s,
    appointments_today: appointments.filter((a) => a.staff_id === s.id).length,
  }));
}

// Upload profile image to Supabase Storage
export async function uploadProfileImage(userId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    console.error('Invalid file type:', file.type);
    return null;
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  // Use userId as folder name for RLS policy compliance
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Delete existing avatar files for this user first
  const { data: existingFiles } = await supabase.storage
    .from('profiles')
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
    await supabase.storage.from('profiles').remove(filesToDelete);
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
  return data.publicUrl;
}
