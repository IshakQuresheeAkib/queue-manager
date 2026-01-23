'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Briefcase, Edit2, Trash2 } from 'lucide-react';
import { StorageManager } from '@/lib/storage/StorageManager';
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
  const storage = useMemo(() => (user ? new StorageManager(user.email) : null), [user]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<ServiceDuration>(30);
  const [requiredStaffType, setRequiredStaffType] = useState('');

  const serviceTypes = ['Doctor', 'Consultant', 'Support Agent', 'Therapist', 'Specialist'];
  const durations: ServiceDuration[] = [15, 30, 60];

  // Load services data with useMemo instead of useEffect
  const services = useMemo(() => {
    if (!storage) return [];
    return storage.getServices();
  }, [storage, refreshKey]);

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

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (!storage || !user) return;

    if (!name.trim() || !requiredStaffType) {
      alert('Please fill all required fields');
      return;
    }

    const servicesList = storage.getServices();

    if (editingService) {
      const index = servicesList.findIndex((s) => s.id === editingService.id);
      if (index !== -1) {
        servicesList[index] = {
          ...editingService,
          name: name.trim(),
          duration,
          required_staff_type: requiredStaffType,
          updated_at: new Date().toISOString(),
        };
        storage.addActivityLog({
          action_type: 'service_updated',
          appointment_id: null,
          description: `Service "${name}" updated`,
        });
      }
    } else {
      const newService: Service = {
        id: `service_${Date.now()}`,
        user_id: user.email,
        name: name.trim(),
        duration,
        required_staff_type: requiredStaffType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      servicesList.push(newService);
      storage.addActivityLog({
        action_type: 'service_created',
        appointment_id: null,
        description: `Service "${name}" created`,
      });
    }

    storage.setServices(servicesList);
    setRefreshKey((prev) => prev + 1); // Trigger refresh
    closeModal();
  }, [storage, user, editingService, name, duration, requiredStaffType, closeModal]);

  const handleDelete = useCallback((id: string): void => {
    if (!storage) return;
    if (!confirm('Are you sure you want to delete this service?')) return;

    const appointments = storage.getAppointments();
    const hasAppointments = appointments.some((a) => a.service_id === id);

    if (hasAppointments) {
      alert('Cannot delete service with existing appointments. Please delete or reassign appointments first.');
      return;
    }

    const servicesList = storage.getServices().filter((s) => s.id !== id);
    storage.setServices(servicesList);
    storage.addActivityLog({
      action_type: 'service_deleted',
      description: 'Service deleted',
      appointment_id: null,
    });
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  }, [storage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage available services</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={20} />}>
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
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
            <Button type="submit" variant="primary" className="flex-1">
              {editingService ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}