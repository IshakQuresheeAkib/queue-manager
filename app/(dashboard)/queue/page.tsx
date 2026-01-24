'use client';

import { useState, useEffect, useCallback } from 'react';
import { List, Calendar, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { getAppointmentsWithDetails, getStaff, getServices, updateAppointment, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AppointmentWithDetails, Staff, Service } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function QueuePage() {
  const { user } = useAuth();

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

      const today = new Date().toISOString().split('T')[0];
      let assignedStaff: Staff | null = null;

      // Get all appointments for today
      const allAppointments = await getAppointmentsWithDetails(user.id);
      const todayAppointments = allAppointments.filter(
        (a) => a.appointment_date === today && a.status !== 'Cancelled'
      );

      for (const staffMember of eligibleStaff) {
        const load = todayAppointments.filter((a) => a.staff_id === staffMember.id).length;

        if (load < staffMember.daily_capacity) {
          assignedStaff = staffMember;
          break;
        }
      }

      if (!assignedStaff) {
        alert('No available staff members to assign this appointment.');
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

      // Refresh data
      const appointmentsData = await getAppointmentsWithDetails(user.id);
      const queued = appointmentsData
        .filter((a) => a.in_queue)
        .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));
      setQueuedAppointments(queued);
    } catch (err) {
      console.error('Error assigning from queue:', err);
      setError('Failed to assign appointment from queue');
    }
  }, [user, queuedAppointments, staff, services]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waiting Queue</h1>
        <p className="text-gray-600 mt-1">Manage appointments waiting for staff assignment</p>
      </div>

      {error && (
        <Card>
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">Loading queue...</p>
          </div>
        </Card>
      ) : queuedAppointments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Queue is Empty</h3>
            <p className="text-gray-600">No appointments are waiting for staff assignment</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queuedAppointments.map((apt) => (
            <Card key={apt.id} hover>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-[250px]">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">#{apt.queue_position}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{apt.customer_name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        {apt.service?.name || 'N/A'} ({apt.service?.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">Required: {apt.service?.required_staff_type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {apt.appointment_time}
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