'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Edit2, Trash2, Users } from 'lucide-react';
import { getStaff, addStaff, updateStaff, deleteStaff, getAppointments, updateAppointment, addActivityLog, getAllUniqueTypes } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import { SkeletonGridCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastContext';
import type { Staff, AvailabilityStatus } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function StaffPage() {
  const { user } = useAuth();
  const toast = useToast();

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
  const [serviceTypeSuggestions, setServiceTypeSuggestions] = useState<string[]>([]);

  const defaultTypes = ['Doctor', 'Consultant', 'Support Agent', 'Therapist', 'Specialist'];

  // Load staff data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, existingTypes] = await Promise.all([
          getStaff(user.id),
          getAllUniqueTypes(user.id),
        ]);
        setStaff(data);
        // Combine existing types with defaults, removing duplicates
        const combined = new Set([...existingTypes, ...defaultTypes]);
        setServiceTypeSuggestions(Array.from(combined).sort());
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
      toast.warning('Please fill all required fields');
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
          toast.success(`Staff member "${name}" updated`);
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
          toast.success(`Staff member "${name}" created`);
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Failed to save staff member');
      toast.error('Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  }, [user, editingStaff, name, serviceType, dailyCapacity, availabilityStatus, closeModal, toast]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (!user) return;
    const confirmed = await toast.confirm({
      title: 'Delete Staff Member',
      message: 'Are you sure you want to delete this staff member? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      setError(null);
      const appointments = await getAppointments(user.id);
      const hasActiveAppointments = appointments.some(
        (a) => a.staff_id === id && a.status === 'Scheduled' && new Date(a.appointment_date) >= new Date()
      );

      if (hasActiveAppointments) {
        const proceed = await toast.confirm({
          title: 'Active Appointments Found',
          message: 'This staff member has active future appointments. These will be moved to the queue. Continue?',
          confirmText: 'Continue',
          cancelText: 'Cancel',
          variant: 'warning',
        });
        if (!proceed) return;

        // Move appointments to queue with sequential positions
        const queuedAppts = appointments.filter((apt) => apt.in_queue);
        const maxPosition = queuedAppts.length > 0 ? Math.max(...queuedAppts.map((apt) => apt.queue_position || 0)) : 0;

        let nextQueuePosition = maxPosition + 1;
        for (const apt of appointments) {
          if (apt.staff_id === id && apt.status === 'Scheduled') {
            await updateAppointment(apt.id, {
              staff_id: null,
              in_queue: true,
              queue_position: nextQueuePosition,
            });
            nextQueuePosition++;
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
        toast.success(`Staff member deleted${hasActiveAppointments ? ' (appointments moved to queue)' : ''}`);
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member');
      toast.error('Failed to delete staff member');
    }
  }, [user, toast]);

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
          toast.success(`${staffMember.name} is now ${newStatus}`);
        }
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError('Failed to update staff availability');
      toast.error('Failed to update staff availability');
    }
  }, [user, staff, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading title="Staff Management" tagline="Manage your team members" />
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={20} />} disabled={loading}>
          Add Staff
        </Button>
      </div>

      {error && (
        <Card>
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <SkeletonGridCard />
          <SkeletonGridCard />
          <SkeletonGridCard />
        </div>
      ) : staff.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white/40" size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Staff Members</h3>
            <p className="text-white/60 mb-4">Get started by adding your first staff member</p>
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
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <User className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{s.name}</h3>
                    <p className="text-sm text-white/60">{s.service_type}</p>
                  </div>
                </div>
                <Badge variant={s.availability_status === 'Available' ? 'success' : 'warning'}>
                  {s.availability_status}
                </Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Daily Capacity</span>
                  <span className="font-medium text-white/80">{s.daily_capacity} appointments</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
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
          <Combobox
            label="Service Type"
            value={serviceType}
            onChange={setServiceType}
            suggestions={serviceTypeSuggestions}
            placeholder="Type or select any service type from below..."
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