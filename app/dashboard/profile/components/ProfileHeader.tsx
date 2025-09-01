'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile, ProfileUpdateData } from '../types/profile';
import AvatarUpload from './AvatarUpload';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
}

export default function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    const result = await onUpdate(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const getUserInitials = () => {
    const first = profile?.firstName?.charAt(0) || '';
    const last = profile?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Cover gradient */}
      <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      
      <div className="relative px-4 pb-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-12 sm:-mt-16">
          <div className="relative">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl sm:text-3xl font-bold">
                  {getUserInitials()}
                </span>
              </div>
            )}
            <AvatarUpload 
              currentImage={profile?.profileImage}
              onImageUpdate={(imageUrl) => onUpdate({ profileImage: imageUrl })}
            />
          </div>
          
          {/* User info */}
          <div className="flex-1 mt-4 sm:mt-0 sm:pb-4">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold"
                    placeholder="First name"
                  />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold"
                    placeholder="Last name"
                  />
                </div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={2}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  {profile?.email}
                </p>
                {profile?.bio && (
                  <p className="text-gray-700 mt-2 text-sm sm:text-base">
                    {profile.bio}
                  </p>
                )}
                {profile?.isStudent && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <i className="ri-graduation-cap-line mr-1"></i>
                      Student
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}