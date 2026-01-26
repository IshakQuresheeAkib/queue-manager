'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/ui/AuthContext';
import { useToast } from '@/components/ui/ToastContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProfilePageSkeleton } from '@/components/ui/PageSkeletons';
import { Heading } from '@/components/ui/Heading';
import { ImageCropUpload } from '@/components/ui/ImageCropUpload';
import type { UserProfile } from '@/types';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profileData = await getUserProfile(user.id);
        if (profileData) {
          setProfile(profileData);
          setFormData({
            name: profileData.name || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setErrorMessage('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleImageCropped = async (file: File) => {
    if (!user) return;

    setIsUploadingImage(true);
    setErrorMessage('');

    try {
      const imageUrl = await uploadProfileImage(user.id, file);
      if (imageUrl) {
        const updatedProfile = await updateUserProfile(user.id, { image_url: imageUrl });
        if (updatedProfile) {
          setProfile(updatedProfile);
          await refreshProfile();
          setSuccessMessage('Profile image updated successfully!');
          toast.success('Profile image updated!');
        } else {
          setErrorMessage('Failed to update profile image');
          toast.error('Failed to update profile image');
        }
      } else {
        setErrorMessage('Failed to upload image');
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrorMessage('Failed to upload image');
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const updatedProfile = await updateUserProfile(user.id, {
        name: formData.name || null,
        phone: formData.phone || null,
        address: formData.address || null,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        await refreshProfile();
        setSuccessMessage('Profile updated successfully!');
        toast.success('Profile updated successfully!');
      } else {
        setErrorMessage('Failed to update profile');
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Heading title="Profile Settings" tagline="Manage your account information" />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="mt-4">
              {
                !profile?.image_url && <User size={48} className="text-white/30 mb-2 mx-auto" />
              }
              <ImageCropUpload
                onImageCropped={handleImageCropped}
                currentImage={profile?.image_url || undefined}
                aspectRatio={1}
                maxSize={5}
                loading={isUploadingImage}
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="text-white/40" size={20} />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-lg bg-white/5 text-white/40 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-white/30 mt-1">Email cannot be changed</p>
          </div>

          {/* Name */}
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="Enter your full name"
            icon={<User size={20} color='green' />}
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="+1 (555) 123-4567"
            icon={<Phone size={20} color='green' />}
          />

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MapPin color='green' size={20} />
              </div>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 outline-none resize-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded-lg text-sm flex items-center gap-2"
            >
              <Save size={16} />
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSaving}
            icon={isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
