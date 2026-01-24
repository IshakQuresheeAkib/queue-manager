'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Briefcase, Edit2, Trash2 } from 'lucide-react';
import { getServices, addService, updateService, deleteService, getAppointments, addActivityLog } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Service, ServiceDuration } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function ServicesPage() {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<ServiceDuration>(30);
  const [requiredStaffType, setRequiredStaffType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const serviceTypes = ['Doctor', 'Consultant', 'Support Agent', 'Therapist', 'Specialist'];
  const durations: ServiceDuration[] = [15, 30, 60];

  // Load services data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getServices(user.id);
        setServices(data);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user]);

  const openModal = useCallback((service?: Service): void => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDuration(service.duration);
      setRequiredStaffType(service.required_staff_type);
    } else {
      setEditingService(null);
      setName('');
      setDuration(30);
      setRequiredStaffType('');
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    setEditingService(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !requiredStaffType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingService) {
        const updated = await updateService(editingService.id, {
          name: name.trim(),
          duration,
          required_staff_type: requiredStaffType,
        });
        
        if (updated) {
          setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          await addActivityLog({
            user_id: user.id,
            action_type: 'service_updated',
            appointment_id: null,
            description: `Service "${name}" updated`,
          });
        }
      } else {
        const created = await addService({
          user_id: user.id,
          name: name.trim(),
          duration,
          required_staff_type: requiredStaffType,
        });
        
        if (created) {
          setServices((prev) => [created, ...prev]);
          await addActivityLog({
            user_id: user.id,
            action_type: 'service_created',
            appointment_id: null,
            description: `Service "${name}" created`,
          });
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  }, [user, editingService, name, duration, requiredStaffType, closeModal]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      setError(null);
      const appointments = await getAppointments(user.id);
      const hasAppointments = appointments.some((a) => a.service_id === id);

      if (hasAppointments) {
        alert('Cannot delete service with existing appointments. Please delete or reassign appointments first.');
        return;
      }

      const success = await deleteService(id);
      if (success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        await addActivityLog({
          user_id: user.id,
          action_type: 'service_deleted',
          description: 'Service deleted',
          appointment_id: null,
        });
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage available services</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={20} />} disabled={loading}>
          Add Service
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
            <p className="text-gray-500">Loading services...</p>
          </div>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services</h3>
            <p className="text-gray-600 mb-4">Create your first service to get started</p>
            <Button onClick={() => openModal()} icon={<Plus size={20} />}>
              Add Service
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Briefcase className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.duration} minutes</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <Badge variant="info">Requires: {service.required_staff_type}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" icon={<Edit2 size={16} />} onClick={() => openModal(service)} className="flex-1">
                  Edit
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(service.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Service Name" value={name} onChange={setName} placeholder="e.g., General Consultation" required />
          <Select
            label="Duration"
            value={duration.toString()}
            onChange={(val) => setDuration(parseInt(val) as ServiceDuration)}
            options={durations.map((d) => ({ value: d.toString(), label: `${d} minutes` }))}
            required
          />
          <Select
            label="Required Staff Type"
            value={requiredStaffType}
            onChange={setRequiredStaffType}
            options={serviceTypes.map((type) => ({ value: type, label: type }))}
            placeholder="Select staff type"
            required
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingService ? 'Update' : 'Create'}
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