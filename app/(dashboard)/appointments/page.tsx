'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Clock, Briefcase, User, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getAppointmentsWithDetails, deleteAppointment, updateAppointment, getStaff, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { SkeletonAppointmentCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import type { AppointmentWithDetails, Staff } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';
import { formatTime12Hour } from '@/lib/utils/date';

// Helper to convert Date to YYYY-MM-DD string
const dateToString = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterStaff, setFilterStaff] = useState('');

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [appointmentsData, staffData] = await Promise.all([
          getAppointmentsWithDetails(user.id),
          getStaff(user.id),
        ]);
        setAppointments(appointmentsData);
        setStaff(staffData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (!user) return;
    const confirmed = await toast.confirm({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      setError(null);
      const success = await deleteAppointment(id);
      if (success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        await addActivityLog({
          user_id: user.id,
          action_type: 'appointment_deleted',
          appointment_id: null,
          description: 'Appointment deleted',
        });
        toast.success('Appointment deleted');
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment');
      toast.error('Failed to delete appointment');
    }
  }, [user, toast]);

  const handleStatusChange = useCallback(async (id: string, status: 'Completed' | 'Cancelled' | 'No-Show'): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      const appointment = appointments.find((a) => a.id === id);
      if (appointment) {
        const updated = await updateAppointment(id, { status });
        if (updated) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status } : a))
          );
          await addActivityLog({
            user_id: user.id,
            action_type: 'appointment_status_updated',
            appointment_id: null,
            description: `Appointment for "${appointment.customer_name}" marked as ${status}`,
          });
          toast.success(`Appointment marked as ${status}`);
        }
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
      toast.error('Failed to update appointment status');
    }
  }, [user, appointments, toast]);

  // Filter and sort appointments using useMemo
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    if (filterDate) {
      const dateString = dateToString(filterDate);
      filtered = filtered.filter((a) => a.appointment_date === dateString);
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
          <Heading title="Appointments" tagline="Manage all appointments" />
        </div>
        <Button onClick={() => router.push('/appointments/new')} icon={<Plus size={20} />} disabled={loading}>
          New Appointment
        </Button>
      </div>

      {error && (
        <Card>
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Filter by Date"
            value={filterDate}
            onChange={setFilterDate}
            placeholder="Select date"
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
        {loading ? (
          <>
            <SkeletonAppointmentCard />
            <SkeletonAppointmentCard />
            <SkeletonAppointmentCard />
          </>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="mx-auto text-white mb-4" size={48} />
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
                    <h3 className="text-lg font-bold text-gray-200">{apt.customer_name}</h3>
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
                    <div className="flex items-center gap-2 text-white">
                      <Briefcase size={16} />
                      {apt.service?.name || 'N/A'} ({apt.service?.duration} min)
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <User size={16} />
                      {apt.staff?.name || 'Unassigned'}
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={16} />
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Clock size={16} />
                      {formatTime12Hour(apt.appointment_time)}
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