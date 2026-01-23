'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { StorageManager } from '@/lib/storage/StorageManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { Staff, Service, Appointment } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Create storage once with useMemo
  const storage = useMemo(() => (user ? new StorageManager(user.email) : null), [user]);

  // Load data once with useMemo instead of useEffect + useState
  const services = useMemo(() => storage?.getServices() ?? [], [storage]);
  console.log('services: ', services);
  const staff = useMemo(() => storage?.getStaff() ?? [], [storage]);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate eligible staff using useMemo (derived state)
  const eligibleStaff = useMemo(() => {
    if (!serviceId) return [];
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];
    return staff.filter((s) => s.service_type === service.required_staff_type);
  }, [serviceId, services, staff]);

  // Calculate conflict warning using useMemo (derived state)
  const conflictWarning = useMemo(() => {
    if (!staffId || !appointmentDate || !appointmentTime || !serviceId || !storage) {
      return '';
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) return '';

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + service.duration;

    const appointments = storage.getAppointments();
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

    return hasConflict ? 'This staff member already has an appointment at this time.' : '';
  }, [staffId, appointmentDate, appointmentTime, serviceId, services, storage]);

  // Calculate staff load using useCallback
  const getStaffLoad = useCallback((staffMemberId: string): number => {
    if (!appointmentDate || !storage) return 0;
    return storage
      .getAppointments()
      .filter(
        (a) =>
          a.staff_id === staffMemberId &&
          a.appointment_date === appointmentDate &&
          a.status !== 'Cancelled'
      ).length;
  }, [appointmentDate, storage]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!storage || !user) return;

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
      alert('Please resolve the time conflict before creating the appointment.');
      return;
    }

    const appointments = storage.getAppointments();
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    let finalStaffId = staffId;
    let inQueue = false;
    let queuePosition: number | null = null;

    // Auto-assign logic
    if (!staffId) {
      const availableStaff = eligibleStaff.find((s) => {
        const load = getStaffLoad(s.id);
        return s.availability_status === 'Available' && load < s.daily_capacity;
      });

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

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      user_id: user.email,
      customer_name: customerName.trim(),
      service_id: serviceId,
      staff_id: finalStaffId || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'Scheduled',
      in_queue: inQueue,
      queue_position: queuePosition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    appointments.push(newAppointment);
    storage.setAppointments(appointments);

    if (inQueue) {
      storage.addActivityLog({
        action_type: 'appointment_queued',
        description: `Appointment for "${customerName}" added to queue (position ${queuePosition})`,
        appointment_id: null,
      });
    } else {
      const staffMember = staff.find((s) => s.id === finalStaffId);
      storage.addActivityLog({
        action_type: 'appointment_created',
        description: `Appointment for "${customerName}" created and assigned to ${staffMember?.name || 'staff'}`,
        appointment_id: null,
      });
    }

    router.push('/appointments');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Appointment</h1>
        <p className="text-gray-600 mt-1">Fill in the appointment details</p>
      </div>

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
                      <p className="font-medium">Auto-assign or Queue</p>
                      <p className="text-sm text-gray-600">
                        System will assign available staff or add to queue
                      </p>
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
                              <p className="font-medium">{s.name}</p>
                              <p className="text-sm text-gray-600">{s.service_type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
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
                  <p className="font-medium">{conflictWarning}</p>
                  <p className="text-sm mt-1">
                    Please choose another staff member or change the time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary">
              Create Appointment
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/appointments')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
