'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Edit2, Trash2, Users } from 'lucide-react';
import { getStaff, addStaff, updateStaff, deleteStaff, getAppointments, updateAppointment, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Staff, AvailabilityStatus } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function StaffPage() {
  const { user } = useAuth();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState('5');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Available');
  const [submitting, setSubmitting] = useState(false);

  const serviceTypes = ['Doctor', 'Consultant', 'Support Agent', 'Therapist', 'Specialist'];

  // Load staff data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStaff(user.id);
        setStaff(data);
      } catch (err) {
        console.error('Error loading staff:', err);
        setError('Failed to load staff members');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user]);

  const openModal = useCallback((staffMember?: Staff): void => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setName(staffMember.name);
      setServiceType(staffMember.service_type);
      setDailyCapacity(staffMember.daily_capacity.toString());
      setAvailabilityStatus(staffMember.availability_status);
    } else {
      setEditingStaff(null);
      setName('');
      setServiceType('');
      setDailyCapacity('5');
      setAvailabilityStatus('Available');
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setEditingStaff(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !serviceType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingStaff) {
        const updated = await updateStaff(editingStaff.id, {
          name: name.trim(),
          service_type: serviceType,
          daily_capacity: parseInt(dailyCapacity),
          availability_status: availabilityStatus,
        });
        
        if (updated) {
          setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          await addActivityLog({
            user_id: user.id,
            action_type: 'staff_updated',
            appointment_id: null,
            description: `Staff member "${name}" updated`,
          });
        }
      } else {
        const created = await addStaff({
          user_id: user.id,
          name: name.trim(),
          service_type: serviceType,
          daily_capacity: parseInt(dailyCapacity),
          availability_status: availabilityStatus,
        });
        
        if (created) {
          setStaff((prev) => [created, ...prev]);
          await addActivityLog({
            user_id: user.id,
            action_type: 'staff_created',
            appointment_id: null,
            description: `Staff member "${name}" created`,
          });
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  }, [user, editingStaff, name, serviceType, dailyCapacity, availabilityStatus, closeModal]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      setError(null);
      const appointments = await getAppointments(user.id);
      const hasActiveAppointments = appointments.some(
        (a) => a.staff_id === id && a.status === 'Scheduled' && new Date(a.appointment_date) >= new Date()
      );

      if (hasActiveAppointments) {
        const proceed = confirm(
          'This staff member has active future appointments. These will be moved to the queue. Continue?'
        );
        if (!proceed) return;

        // Move appointments to queue
        const queuedAppts = appointments.filter((apt) => apt.in_queue);
        const maxPosition = queuedAppts.length > 0 ? Math.max(...queuedAppts.map((apt) => apt.queue_position || 0)) : 0;

        for (const apt of appointments) {
          if (apt.staff_id === id && apt.status === 'Scheduled') {
            await updateAppointment(apt.id, {
              staff_id: null,
              in_queue: true,
              queue_position: maxPosition + 1,
            });
          }
        }
      }

      const success = await deleteStaff(id);
      if (success) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
        await addActivityLog({
          user_id: user.id,
          action_type: 'staff_deleted',
          appointment_id: null,
          description: `Staff member deleted${hasActiveAppointments ? ' (appointments moved to queue)' : ''}`,
        });
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member');
    }
  }, [user]);

  const toggleAvailability = useCallback(async (id: string): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      const staffMember = staff.find((s) => s.id === id);
      if (staffMember) {
        const newStatus = staffMember.availability_status === 'Available' ? 'On Leave' : 'Available';
        const updated = await updateStaff(id, {
          availability_status: newStatus,
        });
        
        if (updated) {
          setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          await addActivityLog({
            user_id: user.id,
            action_type: 'staff_availability_changed',
            appointment_id: null,
            description: `${staffMember.name} status changed to ${newStatus}`,
          });
        }
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Failed to update staff availability');
    }
  }, [user, staff]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={20} />} disabled={loading}>
          Add Staff
        </Button>
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
            <p className="text-gray-500">Loading staff members...</p>
          </div>
        </Card>
      ) : staff.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Members</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first staff member</p>
            <Button onClick={() => openModal()} icon={<Plus size={20} />}>
              Add Staff Member
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s) => (
            <Card key={s.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-600">{s.service_type}</p>
                  </div>
                </div>
                <Badge variant={s.availability_status === 'Available' ? 'success' : 'warning'}>
                  {s.availability_status}
                </Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Daily Capacity</span>
                  <span className="font-medium text-gray-700">{s.daily_capacity} appointments</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => toggleAvailability(s.id)} className="flex-1">
                  {s.availability_status === 'Available' ? 'Set On Leave' : 'Set Available'}
                </Button>
                <Button size="sm" variant="secondary" icon={<Edit2 size={16} />} onClick={() => openModal(s)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(s.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={setName} placeholder="Enter staff name" required />
          <Select
            label="Service Type"
            value={serviceType}
            onChange={setServiceType}
            options={serviceTypes.map((type) => ({ value: type, label: type }))}
            placeholder="Select service type"
            required
          />
          <Input label="Daily Capacity" type="number" value={dailyCapacity} onChange={setDailyCapacity} placeholder="5" required />
          <Select
            label="Availability Status"
            value={availabilityStatus}
            onChange={(val) => setAvailabilityStatus(val as AvailabilityStatus)}
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'On Leave', label: 'On Leave' },
            ]}
            required
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}