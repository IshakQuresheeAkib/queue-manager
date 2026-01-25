'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Combobox } from '@/components/ui/Combobox';
import type { AvailabilityStatus } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';
import { addActivityLog, addStaff, getAllUniqueTypes } from '@/lib/supabase/queries';

export default function NewStaffPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [dailyCapacity, setDailyCapacity] = useState('5');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Available');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypeSuggestions, setServiceTypeSuggestions] = useState<string[]>([]);

  const defaultTypes = ['Doctor', 'Consultant', 'Support Agent', 'Therapist', 'Specialist'];

  // Load suggestions from database
  useEffect(() => {
    if (!user) return;

    const fetchSuggestions = async () => {
      const existingTypes = await getAllUniqueTypes(user.id);
      const combined = new Set([...existingTypes, ...defaultTypes]);
      setServiceTypeSuggestions(Array.from(combined).sort());
    };

    fetchSuggestions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !serviceType) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const created = await addStaff({
        user_id: user.id,
        name: name.trim(),
        service_type: serviceType,
        daily_capacity: parseInt(dailyCapacity),
        availability_status: availabilityStatus,
      });

      if (created) {
        await addActivityLog({
          user_id: user.id,
          action_type: 'staff_created',
          appointment_id: null,
          description: `Staff member "${name}" created`,
        });

        router.push('/staff');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
      setError('Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Staff Member</h1>
        <p className="text-gray-600 mt-1">Add a new team member</p>
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
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Enter staff name"
            required
          />
          <Combobox
            label="Service Type"
            value={serviceType}
            onChange={setServiceType}
            suggestions={serviceTypeSuggestions}
            placeholder="Type or select any service type from below..."
            required
          />
          <Input
            label="Daily Capacity"
            type="number"
            value={dailyCapacity}
            onChange={setDailyCapacity}
            placeholder="5"
            required
          />
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
              {submitting ? 'Creating...' : 'Create Staff Member'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/staff')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}