import { Staff, Service, Appointment, ActivityLog } from '@/types';

const STORAGE_KEYS = {
  USER: 'app_user',
  STAFF: 'app_staff',
  SERVICES: 'app_services',
  APPOINTMENTS: 'app_appointments',
  ACTIVITY_LOGS: 'app_activity_logs',
};

export class StorageManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private getKey(key: string): string {
    return `${key}_${this.userId}`;
  }

  getStaff(): Staff[] {
    const data = localStorage.getItem(this.getKey(STORAGE_KEYS.STAFF));
    return data ? JSON.parse(data) : [];
  }

  setStaff(staff: Staff[]): void {
    localStorage.setItem(
      this.getKey(STORAGE_KEYS.STAFF),
      JSON.stringify(staff)
    );
  }

  getServices(): Service[] {
    const data = localStorage.getItem(this.getKey(STORAGE_KEYS.SERVICES));
    return data ? JSON.parse(data) : [];
  }

  setServices(services: Service[]): void {
    localStorage.setItem(
      this.getKey(STORAGE_KEYS.SERVICES),
      JSON.stringify(services)
    );
  }

  getAppointments(): Appointment[] {
    const data = localStorage.getItem(this.getKey(STORAGE_KEYS.APPOINTMENTS));
    return data ? JSON.parse(data) : [];
  }

  setAppointments(appointments: Appointment[]): void {
    localStorage.setItem(
      this.getKey(STORAGE_KEYS.APPOINTMENTS),
      JSON.stringify(appointments)
    );
  }

  getActivityLogs(): ActivityLog[] {
    const data = localStorage.getItem(this.getKey(STORAGE_KEYS.ACTIVITY_LOGS));
    return data ? JSON.parse(data) : [];
  }

  setActivityLogs(logs: ActivityLog[]): void {
    localStorage.setItem(
      this.getKey(STORAGE_KEYS.ACTIVITY_LOGS),
      JSON.stringify(logs)
    );
  }

  addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random()}`,
      user_id: this.userId,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setActivityLogs(logs.slice(0, 50));
  }
}