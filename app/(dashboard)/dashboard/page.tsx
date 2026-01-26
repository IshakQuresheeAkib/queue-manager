'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, CheckCircle, Clock, List, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAppointments, getStaff, getActivityLogs } from '@/lib/supabase/queries';
import { useAppointmentsRealtime, useStaffRealtime, useActivityLogsRealtime } from '@/lib/supabase/realtime';
import { getTodayString } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/PageSkeletons';
import { Heading } from '@/components/ui/Heading';
import type { Appointment, Staff, ActivityLog } from '@/types';
import { useAuth } from '@/components/ui/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsData, staffData, logsData] = await Promise.all([
          getAppointments(user.id),
          getStaff(user.id),
          getActivityLogs(user.id, 10)
        ]);
        
        setAppointments(appointmentsData);
        setStaff(staffData);
        setActivityLogs(logsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Real-time subscriptions for live updates
  useAppointmentsRealtime(user?.id ?? '', setAppointments);
  useStaffRealtime(user?.id ?? '', setStaff);
  useActivityLogsRealtime(user?.id ?? '', setActivityLogs, 10);

  const today = getTodayString();
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === today && a.status !== 'Cancelled'
  );
  const completedToday = todayAppointments.filter((a) => a.status === 'Completed').length;
  const pendingToday = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const queueCount = appointments.filter((a) => a.in_queue).length;

  const getStaffLoad = useCallback((staffId: string): number => {
    return todayAppointments.filter((a) => a.staff_id === staffId).length;
  }, [todayAppointments]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading title="Dashboard" tagline="Overview of today's appointments" />
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
              <p className="text-sm text-white/60">Total Today</p>
              <p className="text-3xl font-bold text-white mt-1">{todayAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-400" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Completed</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Pending</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingToday}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">In Queue</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">{queueCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <List className="text-purple-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Staff Load Summary */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Staff Load Summary</h2>
        <div className="space-y-3">
          {staff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40">No staff members yet</p>
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
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-sm text-white/50">{s.service_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white/70">
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
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={24} />
          Recent Activity
        </h2>
        <div className="space-y-2">
          {activityLogs.length === 0 ? (
            <p className="text-white/40 text-center py-4">No recent activity</p>
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
                  className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="text-xs text-white/40 mt-0.5 min-w-[60px]">{timeStr}</span>
                  <p className="text-sm text-white/80">{log.description}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}