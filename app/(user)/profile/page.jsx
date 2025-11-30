'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Mail, Lock, Camera, CheckCircle, XCircle, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newEmail: '',
    profile_image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        newEmail: '',
        profile_image: session.user.image || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setImagePreview(session.user.image || '');
      setLoading(false);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setImagePreview(data.url);
        setFormData(prev => ({ ...prev, profile_image: data.url }));
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if changing
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        showToast('Current password is required to change password', 'error');
        return;
      }

      if (formData.newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showToast('Password confirmation does not match', 'error');
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: formData.name,
          newEmail: formData.newEmail || session.user.email,
          profile_image: formData.profile_image,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('✅ Profile updated successfully!', 'success');
        
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // If email or password changed, sign out and redirect
        if (formData.newEmail || formData.newPassword) {
          setTimeout(() => {
            showToast('Please login again with your new credentials', 'success');
            setTimeout(() => {
              signOut({ callbackUrl: '/login' });
            }, 2000);
          }, 1500);
        } else {
          // Reload session to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">Loading profile...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-8 h-8" />
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="text-center pb-4">
                  <div className="relative inline-block">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mx-auto"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl text-white border-4 border-blue-500 mx-auto">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg transition">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  {uploading && (
                    <div className="mt-3 text-sm text-blue-600 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 animate-bounce" />
                      <span>Uploading image...</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-3">Click camera icon to change profile picture</p>
                  <p className="text-xs text-gray-400 mt-1">Maximum size: 5MB</p>
                </div>

                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Current Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">Your current email address</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        <Mail className="inline w-4 h-4 mr-1" />
                        New Email (optional)
                      </label>
                      <input
                        type="email"
                        value={formData.newEmail}
                        onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current email"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Role</label>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                        session?.user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <User className="w-4 h-4" />
                        <span className="capitalize font-semibold">{session?.user?.role || 'user'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave blank if you don't want to change password
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Note:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If you change your email or password, you'll need to login again</li>
                <li>• Profile picture should be less than 5MB</li>
                <li>• Password must be at least 6 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}