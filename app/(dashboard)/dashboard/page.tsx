'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, CheckCircle, Clock, List, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { StorageManager } from '@/lib/storage/StorageManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Appointment, Staff, ActivityLog } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Create storage instance only once using useMemo
  const storage = useMemo(() => user ? new StorageManager(user.email) : null, [user]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // FIX: Move data loading to a separate function and call it properly
  useEffect(() => {
    if (!storage) return;

    const loadData = () => {
      const loadedAppointments = storage.getAppointments();
      const loadedStaff = storage.getStaff();
      const loadedLogs = storage.getActivityLogs().slice(0, 10);
      
      setAppointments(loadedAppointments);
      setStaff(loadedStaff);
      setActivityLogs(loadedLogs);
    };

    loadData();

    // Optional: Add event listener for storage changes if you want real-time updates
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storage]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === today && a.status !== 'Cancelled'
  );
  const completedToday = todayAppointments.filter((a) => a.status === 'Completed').length;
  const pendingToday = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const queueCount = appointments.filter((a) => a.in_queue).length;

  const getStaffLoad = (staffId: string): number => {
    return todayAppointments.filter((a) => a.staff_id === staffId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of today&apos;s appointments</p>
        </div>
        <Button onClick={() => router.push('/appointments/new')} icon={<Plus size={20} />}>
          New Appointment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingToday}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Queue</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{queueCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <List className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Staff Load Summary */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Staff Load Summary</h2>
        <div className="space-y-3">
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff members yet</p>
              <Button 
                onClick={() => router.push('/staff')} 
                variant="primary" 
                size="sm" 
                className="mt-4"
              >
                Add Your First Staff Member
              </Button>
            </div>
          ) : (
            staff.map((s) => {
              const load = getStaffLoad(s.id);
              const isBooked = load >= s.daily_capacity;
              const isOnLeave = s.availability_status === 'On Leave';

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-600">{s.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {load} / {s.daily_capacity}
                    </span>
                    {isOnLeave ? (
                      <Badge variant="warning">On Leave</Badge>
                    ) : isBooked ? (
                      <Badge variant="danger">Booked</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>

      {/* Activity Log */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={24} />
          Recent Activity
        </h2>
        <div className="space-y-2">
          {activityLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activityLogs.map((log) => {
              const date = new Date(log.created_at);
              const timeStr = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xs text-gray-500 mt-0.5 min-w-[60px]">{timeStr}</span>
                  <p className="text-sm text-gray-700">{log.description}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}