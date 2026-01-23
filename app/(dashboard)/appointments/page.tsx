'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, Briefcase, User, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { StorageManager } from '@/lib/storage/StorageManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AppointmentWithDetails, Staff, Service } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const storage = useMemo(() => (user ? new StorageManager(user.email) : null), [user]);

  const [filterDate, setFilterDate] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger

  // Load data with useMemo instead of useEffect
  const { appointments, staff } = useMemo(() => {
    if (!storage) {
      return { appointments: [], staff: [] };
    }

    const appts = storage.getAppointments();
    const services = storage.getServices();
    const staffList = storage.getStaff();

    const appointmentsWithDetails: AppointmentWithDetails[] = appts.map((a) => {
      const service = services.find((s) => s.id === a.service_id);
      const staffMember = a.staff_id ? staffList.find((s) => s.id === a.staff_id) : null;
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
        staff: staffMember || null,
      };
    });

    return {
      appointments: appointmentsWithDetails,
      staff: staffList,
    };
  }, [storage, refreshKey]); // Add refreshKey to force recalculation

  const handleDelete = useCallback((id: string): void => {
    if (!storage) return;
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    const appts = storage.getAppointments().filter((a) => a.id !== id);
    storage.setAppointments(appts);
    storage.addActivityLog({
      action_type: 'appointment_deleted',
      appointment_id: null,
      description: 'Appointment deleted',
    });
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  }, [storage]);

  const handleStatusChange = useCallback((id: string, status: 'Completed' | 'Cancelled' | 'No-Show'): void => {
    if (!storage) return;

    const appts = storage.getAppointments();
    const appointment = appts.find((a) => a.id === id);
    if (appointment) {
      appointment.status = status;
      storage.setAppointments(appts);
      storage.addActivityLog({
        action_type: 'appointment_status_updated',
        appointment_id: null,
        description: `Appointment for "${appointment.customer_name}" marked as ${status}`,
      });
      setRefreshKey((prev) => prev + 1); // Trigger refresh
    }
  }, [storage]);

  // Filter and sort appointments using useMemo
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (filterDate) {
      filtered = filtered.filter((a) => a.appointment_date === filterDate);
    }
    if (filterStaff) {
      filtered = filtered.filter((a) => a.staff_id === filterStaff);
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
      if (dateCompare !== 0) return dateCompare;
      return a.appointment_time.localeCompare(b.appointment_time);
    });
  }, [appointments, filterDate, filterStaff]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage all appointments</p>
        </div>
        <Button onClick={() => router.push('/appointments/new')} icon={<Plus size={20} />}>
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Filter by Date"
            type="date"
            value={filterDate}
            onChange={setFilterDate}
            icon={<Calendar size={20} />}
          />
          <Select
            label="Filter by Staff"
            value={filterStaff}
            onChange={setFilterStaff}
            options={[{ value: '', label: 'All Staff' }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
          />
        </div>
      </Card>

      {/* Appointments List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <Button onClick={() => router.push('/appointments/new')} className="mt-4">
                Create Your First Appointment
              </Button>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((apt) => (
            <Card key={apt.id} hover>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{apt.customer_name}</h3>
                    {apt.in_queue ? (
                      <Badge variant="warning">Queue #{apt.queue_position}</Badge>
                    ) : (
                      <Badge
                        variant={
                          apt.status === 'Completed'
                            ? 'success'
                            : apt.status === 'Cancelled' || apt.status === 'No-Show'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {apt.status}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      {apt.service?.name || 'N/A'} ({apt.service?.duration} min)
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      {apt.staff?.name || 'Unassigned'}
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
                <div className="flex items-center gap-2 flex-wrap">
                  {apt.status === 'Scheduled' && !apt.in_queue && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(apt.id, 'Completed')}
                        icon={<CheckCircle size={16} />}> Completed</Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                        icon={<XCircle size={16} />}>Cancel</Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Edit2 size={16} />}
                    onClick={() => router.push(`/appointments/${apt.id}/edit`)}
                  >Edit</Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(apt.id)}
                  >Delete</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}