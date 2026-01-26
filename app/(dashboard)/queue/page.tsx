'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Calendar, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { getAppointmentsWithDetails, getStaff, getServices, updateAppointment, addActivityLog } from '@/lib/supabase/queries';
import { useRealtimeSubscription } from '@/lib/supabase/realtime';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonQueueItem } from '@/components/ui/Skeleton';
import { Heading } from '@/components/ui/Heading';
import { useToast } from '@/components/ui/ToastContext';
import type { AppointmentWithDetails, Staff, Service, Appointment } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';
import { formatTime12Hour } from '@/lib/utils/date';

export default function QueuePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [queuedAppointments, setQueuedAppointments] = useState<AppointmentWithDetails[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [appointmentsData, staffData, servicesData] = await Promise.all([
          getAppointmentsWithDetails(user.id),
          getStaff(user.id),
          getServices(user.id),
        ]);

        const queued = appointmentsData
          .filter((a) => a.in_queue)
          .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));

        setQueuedAppointments(queued);
        setStaff(staffData);
        setServices(servicesData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load queue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Real-time subscription for queue updates
  const handleAppointmentChange = useCallback(async () => {
    if (!user) return;
    const appointmentsData = await getAppointmentsWithDetails(user.id);
    const queued = appointmentsData
      .filter((a) => a.in_queue)
      .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
    setQueuedAppointments(queued);
  }, [user]);

  useRealtimeSubscription<Appointment>({
    table: 'appointments',
    userId: user?.id ?? '',
    onInsert: handleAppointmentChange,
    onUpdate: handleAppointmentChange,
    onDelete: handleAppointmentChange,
  });

  const assignFromQueue = useCallback(async (appointmentId: string): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      const appointment = queuedAppointments.find((a) => a.id === appointmentId);

      if (!appointment) return;

      const service = services.find((s) => s.id === appointment.service_id);
      if (!service) return;

      const eligibleStaff = staff.filter(
        (s) => s.service_type === service.required_staff_type && s.availability_status === 'Available'
      );

      const appointmentDate = appointment.appointment_date;
      let assignedStaff: Staff | null = null;

      // Get all appointments for the appointment's date (not today)
      const allAppointments = await getAppointmentsWithDetails(user.id);
      const dateAppointments = allAppointments.filter(
        (a) => a.appointment_date === appointmentDate && a.status !== 'Cancelled'
      );

      for (const staffMember of eligibleStaff) {
        const load = dateAppointments.filter((a) => a.staff_id === staffMember.id).length;

        if (load < staffMember.daily_capacity) {
          assignedStaff = staffMember;
          break;
        }
      }

      if (!assignedStaff) {
        toast.warning('No available staff members to assign this appointment.');
        return;
      }

      // Update the appointment
      await updateAppointment(appointment.id, {
        staff_id: assignedStaff.id,
        in_queue: false,
        queue_position: null,
      });

      // Update queue positions for remaining appointments
      const remainingQueued = queuedAppointments
        .filter((a) => a.id !== appointmentId)
        .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));

      for (let i = 0; i < remainingQueued.length; i++) {
        await updateAppointment(remainingQueued[i].id, {
          queue_position: i + 1,
        });
      }

      await addActivityLog({
        user_id: user.id,
        action_type: 'queue_assigned',
        description: `Appointment for "${appointment.customer_name}" assigned to ${assignedStaff.name} from queue`,
        appointment_id: null,
      });

      toast.success(`Appointment assigned to ${assignedStaff.name}`);

      // Refresh data
      const appointmentsData = await getAppointmentsWithDetails(user.id);
      const queued = appointmentsData
        .filter((a) => a.in_queue)
        .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
      setQueuedAppointments(queued);
    } catch (err) {
      console.error('Error assigning from queue:', err);
      setError('Failed to assign appointment from queue');
      toast.error('Failed to assign appointment from queue');
    }
  }, [user, queuedAppointments, staff, services, toast]);

  return (
    <div className="space-y-6">
      <div>
        <Heading title="Waiting Queue" tagline="Manage appointments waiting for staff assignment" />
      </div>

      {error && (
        <Card>
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          <SkeletonQueueItem />
          <SkeletonQueueItem />
          <SkeletonQueueItem />
        </div>
      ) : queuedAppointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="text-white/40" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Queue is Empty</h3>
            <p className="text-white/60">No appointments are waiting for staff assignment</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queuedAppointments.map((apt) => (
            <Card key={apt.id} hover>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-[250px]">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold">#{apt.queue_position}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{apt.customer_name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/60">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Briefcase size={16} />
                        {apt.service?.name || 'N/A'} ({apt.service?.duration} min)
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Badge variant="info">Required: {apt.service?.required_staff_type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={16} />
                        {formatTime12Hour(apt.appointment_time)}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight size={16} />}
                  onClick={() => assignFromQueue(apt.id)}
                >
                  Assign From Queue
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}