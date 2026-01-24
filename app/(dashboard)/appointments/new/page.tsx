'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServices, getStaff, getAppointments, addAppointment, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { Staff, Service } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, staffData] = await Promise.all([
          getServices(user.id),
          getStaff(user.id),
        ]);
        setServices(servicesData);
        setStaff(staffData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate eligible staff using useMemo (derived state)
  const eligibleStaff = useMemo(() => {
    if (!serviceId) return [];
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];
    return staff.filter((s) => s.service_type === service.required_staff_type);
  }, [serviceId, services, staff]);

  // Calculate conflict warning using useMemo (derived state)
  const conflictWarning = useMemo(() => {
    if (!staffId || !appointmentDate || !appointmentTime || !serviceId) {
      return '';
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) return '';

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + service.duration;

    // Note: This will need appointments data which we'll fetch in handleSubmit
    // For now, we'll simplify and check in handleSubmit
    return '';
  }, [staffId, appointmentDate, appointmentTime, serviceId, services]);

  // Calculate staff load using useCallback
  const getStaffLoad = useCallback(async (staffMemberId: string): Promise<number> => {
    if (!appointmentDate || !user) return 0;
    try {
      const appointments = await getAppointments(user.id);
      return appointments.filter(
        (a) =>
          a.staff_id === staffMemberId &&
          a.appointment_date === appointmentDate &&
          a.status !== 'Cancelled'
      ).length;
    } catch (err) {
      console.error('Error getting staff load:', err);
      return 0;
    }
  }, [appointmentDate, user]);

  // Store staff loads in state
  const [staffLoads, setStaffLoads] = useState<Record<string, number>>({});

  // Update staff loads when eligible staff or date changes
  useEffect(() => {
    if (!appointmentDate || eligibleStaff.length === 0) return;

    const updateLoads = async () => {
      const loads: Record<string, number> = {};
      for (const s of eligibleStaff) {
        loads[s.id] = await getStaffLoad(s.id);
      }
      setStaffLoads(loads);
    };

    updateLoads();
  }, [appointmentDate, eligibleStaff, getStaffLoad]);

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

    try {
      setSubmitting(true);
      setError(null);

      // Check for conflicts
      if (staffId) {
        const appointments = await getAppointments(user.id);
        const service = services.find((s) => s.id === serviceId);
        if (service) {
          const [hours, minutes] = appointmentTime.split(':').map(Number);
          const startTime = hours * 60 + minutes;
          const endTime = startTime + service.duration;

          const hasConflict = appointments.some((a) => {
            if (a.staff_id !== staffId) return false;
            if (a.appointment_date !== appointmentDate) return false;
            if (a.status === 'Cancelled') return false;

            const aptService = services.find((s) => s.id === a.service_id);
            if (!aptService) return false;

            const [aptHours, aptMinutes] = a.appointment_time.split(':').map(Number);
            const aptStartTime = aptHours * 60 + aptMinutes;
            const aptEndTime = aptStartTime + aptService.duration;

            return startTime < aptEndTime && endTime > aptStartTime;
          });

          if (hasConflict) {
            alert('This staff member already has an appointment at this time. Please choose another staff member or change the time.');
            setSubmitting(false);
            return;
          }
        }
      }

      const appointments = await getAppointments(user.id);
      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        setSubmitting(false);
        return;
      }

      let finalStaffId = staffId;
      let inQueue = false;
      let queuePosition: number | null = null;

      // Auto-assign logic
      if (!staffId) {
        let availableStaff: Staff | null = null;
        for (const s of eligibleStaff) {
          const load = await getStaffLoad(s.id);
          if (s.availability_status === 'Available' && load < s.daily_capacity) {
            availableStaff = s;
            break;
          }
        }

        if (!availableStaff) {
          inQueue = true;
          const queuedAppointments = appointments.filter((a) => a.in_queue);
          queuePosition =
            queuedAppointments.length > 0
              ? Math.max(...queuedAppointments.map((a) => a.queue_position || 0)) + 1
              : 1;
        } else {
          finalStaffId = availableStaff.id;
        }
      }

      const newAppointment = await addAppointment({
        user_id: user.id,
        customer_name: customerName.trim(),
        service_id: serviceId,
        staff_id: finalStaffId || null,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'Scheduled',
        in_queue: inQueue,
        queue_position: queuePosition,
      });

      if (newAppointment) {
        if (inQueue) {
          await addActivityLog({
            user_id: user.id,
            action_type: 'appointment_queued',
            description: `Appointment for "${customerName}" added to queue (position ${queuePosition})`,
            appointment_id: null,
          });
        } else {
          const staffMember = staff.find((s) => s.id === finalStaffId);
          await addActivityLog({
            user_id: user.id,
            action_type: 'appointment_created',
            description: `Appointment for "${customerName}" created and assigned to ${staffMember?.name || 'staff'}`,
            appointment_id: null,
          });
        }

        router.push('/appointments');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Appointment</h1>
        <p className="text-gray-600 mt-1">Fill in the appointment details</p>
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
            <p className="text-gray-500">Loading form...</p>
          </div>
        </Card>
      ) : (
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

          <Input
            label="Appointment Date"
            type="date"
            value={appointmentDate}
            onChange={setAppointmentDate}
            error={errors.appointmentDate}
            required
          />

          <Input
            label="Appointment Time"
            type="time"
            value={appointmentTime}
            onChange={setAppointmentTime}
            error={errors.appointmentTime}
            required
          />

          {serviceId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Staff (Optional)
              </label>
              <div className="space-y-2">
                {eligibleStaff.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    No eligible staff for this service type. Please create staff members first.
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
                      <p className="font-medium text-gray-700">Auto-assign or Queue</p>
                      <p className="text-sm text-gray-600">
                        System will assign available staff or add to queue
                      </p>
                    </div>
                    {eligibleStaff.map((s) => {
                      const load = staffLoads[s.id] || 0;
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {load} / {s.daily_capacity} appointments today
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
                  <p className="text-sm mt-1">
                    Please choose another staff member or change the time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Appointment'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/appointments')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
      )}
    </div>
  );
}
