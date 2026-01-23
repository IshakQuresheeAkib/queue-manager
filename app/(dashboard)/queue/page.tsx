'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { List, Calendar, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { StorageManager } from '@/lib/storage/StorageManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AppointmentWithDetails, Staff, Service } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function QueuePage() {
  const router = useRouter();
  const { user } = useAuth();
  const storage = useMemo(() => (user ? new StorageManager(user.email) : null), [user]);

  const [refreshKey, setRefreshKey] = useState(0);

  // Load all data with useMemo
  const { queuedAppointments, staff, services } = useMemo(() => {
    if (!storage) {
      return { queuedAppointments: [], staff: [], services: [] };
    }

    const appts = storage.getAppointments();
    const servicesList = storage.getServices();
    const staffList = storage.getStaff();

    const queued = appts
      .filter((a) => a.in_queue)
      .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0))
      .map((a) => {
        const service = servicesList.find((s) => s.id === a.service_id);
        return {
          ...a,
          service:
            service ||
            ({
              id: '',
              user_id: '',
              name: 'Unknown Service',
              duration: 30,
              required_staff_type: '',
              created_at: '',
              updated_at: '',
            } as Service),
          staff: null,
        };
      });

    return {
      queuedAppointments: queued,
      staff: staffList,
      services: servicesList,
    };
  }, [storage, refreshKey]);

  const assignFromQueue = useCallback((appointmentId: string): void => {
    if (!storage) return;

    const appointments = storage.getAppointments();
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) return;

    const service = services.find((s) => s.id === appointment.service_id);
    if (!service) return;

    const eligibleStaff = staff.filter(
      (s) => s.service_type === service.required_staff_type && s.availability_status === 'Available'
    );

    const today = new Date().toISOString().split('T')[0];
    let assignedStaff: Staff | null = null;

    for (const staffMember of eligibleStaff) {
      const load = appointments.filter(
        (a) => a.staff_id === staffMember.id && a.appointment_date === today && a.status !== 'Cancelled'
      ).length;

      if (load < staffMember.daily_capacity) {
        assignedStaff = staffMember;
        break;
      }
    }

    if (!assignedStaff) {
      alert('No available staff members to assign this appointment.');
      return;
    }

    appointment.staff_id = assignedStaff.id;
    appointment.in_queue = false;
    appointment.queue_position = null;

    const remainingQueued = appointments
      .filter((a) => a.in_queue && a.id !== appointmentId)
      .sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));

    remainingQueued.forEach((a, index) => {
      a.queue_position = index + 1;
    });

    storage.setAppointments(appointments);
    storage.addActivityLog({
      action_type: 'queue_assigned',
      description: `Appointment for "${appointment.customer_name}" assigned to ${assignedStaff.name} from queue`,
      appointment_id: null,
    });

    setRefreshKey((prev) => prev + 1); // Trigger refresh
  }, [storage, staff, services]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waiting Queue</h1>
        <p className="text-gray-600 mt-1">Manage appointments waiting for staff assignment</p>
      </div>

      {queuedAppointments.length === 0 ? (
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