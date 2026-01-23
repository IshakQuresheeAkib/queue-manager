import { Appointment, Service } from '@/types';

export function hasTimeConflict(
  appointments: Appointment[],
  services: Service[],
  staffId: string,
  date: string,
  time: string,
  duration: number,
  excludeAppointmentId?: string
): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const startTime = hours * 60 + minutes;
  const endTime = startTime + duration;

  const conflicts = appointments.filter((a) => {
    if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
    if (a.staff_id !== staffId) return false;
    if (a.appointment_date !== date) return false;
    if (a.status === 'Cancelled') return false;

    const aptService = services.find((s) => s.id === a.service_id);
    if (!aptService) return false;

    const [aptHours, aptMinutes] = a.appointment_time.split(':').map(Number);
    const aptStartTime = aptHours * 60 + aptMinutes;
    const aptEndTime = aptStartTime + aptService.duration;

    return startTime < aptEndTime && endTime > aptStartTime;
  });

  return conflicts.length > 0;
}