'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServices, getStaff, getAppointments, updateAppointment, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { FormSkeleton } from '@/components/ui/PageSkeletons';
import { Heading } from '@/components/ui/Heading';
import type { Staff, Service, Appointment, AppointmentStatus } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

// Helper functions for date conversion
const dateToString = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const stringToDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  return new Date(dateStr + 'T00:00:00');
};

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('Scheduled');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, staffData, appointmentsData] = await Promise.all([
          getServices(user.id),
          getStaff(user.id),
          getAppointments(user.id),
        ]);

        setServices(servicesData);
        setStaff(staffData);
        setAppointments(appointmentsData);

        const existingAppointment = appointmentsData.find((a) => a.id === appointmentId);
        if (existingAppointment) {
          setCustomerName(existingAppointment.customer_name);
          setServiceId(existingAppointment.service_id);
          setStaffId(existingAppointment.staff_id || '');
          setAppointmentDate(stringToDate(existingAppointment.appointment_date));
          setAppointmentTime(existingAppointment.appointment_time);
          setStatus(existingAppointment.status);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, appointmentId]);

  const currentAppointment = useMemo(
    () => appointments.find((a) => a.id === appointmentId),
    [appointments, appointmentId]
  );

  // Calculate eligible staff using useMemo
  const eligibleStaff = useMemo(() => {
    if (!serviceId) return [];
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];
    return staff.filter((s) => s.service_type === service.required_staff_type);
  }, [serviceId, services, staff]);

  // Calculate conflict warning using useMemo
  const conflictWarning = useMemo(() => {
    if (!staffId || !appointmentDate || !appointmentTime || !serviceId) {
      return '';
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) return '';

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + service.duration;

    const dateString = dateToString(appointmentDate);

    const hasConflict = appointments.some((a) => {
      if (a.id === appointmentId) return false;
      if (a.staff_id !== staffId) return false;
      if (a.appointment_date !== dateString) return false;
      if (a.status === 'Cancelled') return false;

      const aptService = services.find((s) => s.id === a.service_id);
      if (!aptService) return false;

      const [aptHours, aptMinutes] = a.appointment_time.split(':').map(Number);
      const aptStartTime = aptHours * 60 + aptMinutes;
      const aptEndTime = aptStartTime + aptService.duration;

      return startTime < aptEndTime && endTime > aptStartTime;
    });

    return hasConflict ? 'This staff member already has an appointment at this time.' : '';
  }, [staffId, appointmentDate, appointmentTime, serviceId, services, appointments, appointmentId]);

  // Calculate staff load
  const getStaffLoad = useCallback(
    (staffMemberId: string): number => {
      if (!appointmentDate) return 0;
      const dateString = dateToString(appointmentDate);
      return appointments
        .filter(
          (a) =>
            a.id !== appointmentId &&
            a.staff_id === staffMemberId &&
            a.appointment_date === dateString &&
            a.status !== 'Cancelled'
        ).length;
    },
    [appointmentDate, appointments, appointmentId]
  );

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!serviceId) newErrors.serviceId = 'Service is required';
    if (!appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!appointmentTime) newErrors.appointmentTime = 'Time is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (conflictWarning) {
      alert('Please resolve the time conflict before updating the appointment.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const updated = await updateAppointment(appointmentId, {
        customer_name: customerName.trim(),
        service_id: serviceId,
        staff_id: staffId || null,
        appointment_date: dateToString(appointmentDate),
        appointment_time: appointmentTime,
        status,
      });

      if (updated) {
        await addActivityLog({
          user_id: user.id,
          action_type: 'appointment_updated',
          description: `Appointment for "${customerName}" updated`,
          appointment_id: null,
        });

        router.push('/appointments');
      } else {
        setError('Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FormSkeleton fields={6} />;
  }

  if (!currentAppointment) {
    router.push('/appointments');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading title="Edit Appointment" tagline="Update appointment details" />
      </div>

      {error && (
        <Card>
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name"
            value={customerName}
            onChange={setCustomerName}
            placeholder="Enter customer name"
            error={errors.customerName}
            required
          />

          <Select
            label="Service"
            value={serviceId}
            onChange={setServiceId}
            options={services.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.duration} min)`,
            }))}
            placeholder="Select a service"
            error={errors.serviceId}
            required
          />

          <DatePicker
            label="Appointment Date"
            value={appointmentDate}
            onChange={setAppointmentDate}
            minDate={new Date()}
            error={errors.appointmentDate}
            required
          />

          <TimePicker
            label="Appointment Time"
            value={appointmentTime}
            onChange={setAppointmentTime}
            error={errors.appointmentTime}
            required
          />

          <Select
            label="Status"
            value={status}
            onChange={(val) => setStatus(val as AppointmentStatus)}
            options={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
              { value: 'No-Show', label: 'No-Show' },
            ]}
            required
          />

          {serviceId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Staff</label>
              <div className="space-y-2">
                {eligibleStaff.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    No eligible staff for this service type.
                  </p>
                ) : (
                  <>
                    <div
                      onClick={() => setStaffId('')}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        staffId === ''
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="font-medium text-gray-700">Unassign Staff</p>
                      <p className="text-sm text-gray-600">Remove staff assignment</p>
                    </div>
                    {eligibleStaff.map((s) => {
                      const load = getStaffLoad(s.id);
                      const isAtCapacity = load >= s.daily_capacity;
                      const isOnLeave = s.availability_status === 'On Leave';

                      return (
                        <div
                          key={s.id}
                          onClick={() => !isOnLeave && setStaffId(s.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            staffId === s.id
                              ? 'border-blue-500 bg-blue-50'
                              : isOnLeave
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-700">{s.name}</p>
                              <p className="text-sm text-gray-600">{s.service_type}</p>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                              <span className="text-sm text-gray-500">
                                {load} / {s.daily_capacity} today
                              </span>
                              {isOnLeave ? (
                                <Badge variant="warning">On Leave</Badge>
                              ) : isAtCapacity ? (
                                <Badge variant="danger">Full</Badge>
                              ) : (
                                <Badge variant="success">Available</Badge>
                              )}
                            </div>
                          </div>
                          {isAtCapacity && !isOnLeave && (
                            <p className="text-xs text-red-600 mt-1">
                              ⚠️ {s.name} already has {s.daily_capacity} appointments today.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {conflictWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">{conflictWarning}</p>
                  <p className="text-sm mt-1">Please choose another staff member or change the time.</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Appointment'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/appointments')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}