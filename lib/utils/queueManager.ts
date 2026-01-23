import { Appointment, Staff, Service } from '@/types';

export function assignFromQueue(
  appointments: Appointment[],
  staff: Staff[],
  services: Service[],
  appointmentId: string,
  today: string
): { success: boolean; staffId?: string; staffName?: string } {
  const appointment = appointments.find((a) => a.id === appointmentId);

  if (!appointment) {
    return { success: false };
  }

  const service = services.find((s) => s.id === appointment.service_id);
  if (!service) {
    return { success: false };
  }

  const eligibleStaff = staff.filter(
    (s) =>
      s.service_type === service.required_staff_type &&
      s.availability_status === 'Available'
  );

  let assignedStaff: Staff | null = null;

  for (const staffMember of eligibleStaff) {
    const load = appointments.filter(
      (a) =>
        a.staff_id === staffMember.id &&
        a.appointment_date === today &&
        a.status !== 'Cancelled'
    ).length;

    if (load < staffMember.daily_capacity) {
      assignedStaff = staffMember;
      break;
    }
  }

  if (!assignedStaff) {
    return { success: false };
  }

  appointment.staff_id = assignedStaff.id;
  appointment.in_queue = false;
  appointment.queue_position = null;

  // Reorder remaining queue
  const remainingQueued = appointments
    .filter((a) => a.in_queue && a.id !== appointmentId)
    .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));

  remainingQueued.forEach((a, index) => {
    a.queue_position = index + 1;
  });

  return {
    success: true,
    staffId: assignedStaff.id,
    staffName: assignedStaff.name,
  };
}