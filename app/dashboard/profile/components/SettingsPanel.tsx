'use client';

import { useState } from 'react';
import { UserProfile, ProfileUpdateData } from '../types/profile';

interface SettingsPanelProps {
  profile: UserProfile | null;
  onUpdate: (data: ProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
}

export default function SettingsPanel({ profile, onUpdate }: SettingsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    isStudent: profile?.isStudent || false,
    studentInfo: {
      schoolName: profile?.studentInfo?.schoolName || '',
      matriculationNumber: profile?.studentInfo?.matriculationNumber || '',
      department: profile?.studentInfo?.department || '',
      course: profile?.studentInfo?.course || '',
    },
  });

  const handleSave = async () => {
    setIsUpdating(true);
    await onUpdate(formData);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      {/* Student status */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Type</h3>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isStudent"
            checked={formData.isStudent}
            onChange={(e) => setFormData({ ...formData, isStudent: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isStudent" className="text-sm font-medium text-gray-700">
            I am a student
          </label>
        </div>
      </div>

      {/* Student information */}
      {formData.isStudent && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.schoolName}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentInfo: { ...formData.studentInfo, schoolName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matriculation Number
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.matriculationNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentInfo: { ...formData.studentInfo, matriculationNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.department}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentInfo: { ...formData.studentInfo, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <input
                  type="text"
                  value={formData.studentInfo.course}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentInfo: { ...formData.studentInfo, course: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about new books</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Reading Reminders</p>
              <p className="text-sm text-gray-500">Daily reminders to continue reading</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}