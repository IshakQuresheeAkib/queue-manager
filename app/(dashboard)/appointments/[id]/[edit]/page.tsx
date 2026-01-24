'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { StorageManager } from '@/lib/storage/StorageManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { Staff, Service, AppointmentStatus } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const { user } = useAuth();
  const storage = useMemo(() => (user ? new StorageManager(user.email) : null), [user]);

  // Load initial data with useMemo
  const { services, staff, initialAppointment } = useMemo(() => {
    if (!storage) {
      return { services: [], staff: [], initialAppointment: null };
    }

    const servicesList = storage.getServices();
    const staffList = storage.getStaff();
    const apt = storage.getAppointments().find((a) => a.id === appointmentId);

    return {
      services: servicesList,
      staff: staffList,
      initialAppointment: apt || null,
    };
  }, [storage, appointmentId]);

  // Form state
  const [customerName, setCustomerName] = useState(initialAppointment?.customer_name || '');
  const [serviceId, setServiceId] = useState(initialAppointment?.service_id || '');
  const [staffId, setStaffId] = useState(initialAppointment?.staff_id || '');
  const [appointmentDate, setAppointmentDate] = useState(initialAppointment?.appointment_date || '');
  const [appointmentTime, setAppointmentTime] = useState(initialAppointment?.appointment_time || '');
  const [status, setStatus] = useState<AppointmentStatus>(initialAppointment?.status || 'Scheduled');
  const [errors, setErrors] = useState<Record<string, string>>({});

  

  // Calculate eligible staff using useMemo
  const eligibleStaff = useMemo(() => {
    if (!serviceId) return [];
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];
    return staff.filter((s) => s.service_type === service.required_staff_type);
  }, [serviceId, services, staff]);

  // Calculate conflict warning using useMemo
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
      if (a.id === appointmentId) return false; // Exclude current appointment
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
  }, [staffId, appointmentDate, appointmentTime, serviceId, services, storage, appointmentId]);

  

  // Calculate staff load
  const getStaffLoad = useCallback(
    (staffMemberId: string): number => {
      if (!appointmentDate || !storage) return 0;
      return storage
        .getAppointments()
        .filter(
          (a) =>
            a.id !== appointmentId && // Exclude current appointment
            a.staff_id === staffMemberId &&
            a.appointment_date === appointmentDate &&
            a.status !== 'Cancelled'
        ).length;
    },
    [appointmentDate, storage, appointmentId]
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!storage) return;

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

    const appointments = storage.getAppointments();
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (appointment) {
      appointment.customer_name = customerName.trim();
      appointment.service_id = serviceId;
      appointment.staff_id = staffId || null;
      appointment.appointment_date = appointmentDate;
      appointment.appointment_time = appointmentTime;
      appointment.status = status;
      appointment.updated_at = new Date().toISOString();

      storage.setAppointments(appointments);
      storage.addActivityLog({
        action_type: 'appointment_updated',
        description: `Appointment for "${customerName}" updated`,
        appointment_id: null,
      });

      router.push('/appointments');
    }
  };

  // Redirect if appointment not found
  if (!initialAppointment) {
    router.push('/appointments');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Appointment</h1>
        <p className="text-gray-600 mt-1">Update appointment details</p>
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
                            <div className="flex items-center gap-2">
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
            <Button type="submit" variant="primary">
              Update Appointment
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