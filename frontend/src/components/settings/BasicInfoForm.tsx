"use client";

import { useState, useRef } from "react";
import { User } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import ErrorAlert from "@/components/common/ErrorAlert";
import SuccessAlert from "@/components/common/SuccessAlert";
import { Save, AlertCircle, Camera, User as UserIcon } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function BasicInfoForm({ user }: { user: User }) {
  const { updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phoneNumber: user.phoneNumber || "",
    avatarUrl: user.avatarUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setLoading(true);
    setError("");
    setSuccess(null);
    try {
      const res = await api.post(`/identity/users/${user.id}/avatar`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setFormData(prev => ({ ...prev, avatarUrl: res.data.data }));
        useAuthStore.getState().updateUser({ avatarUrl: res.data.data }); // update global store
        setSuccess("Avatar uploaded successfully!");
      } else {
        setError(res.data.message || "Failed to upload avatar");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while uploading the avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Changed setIsLoading to setLoading
    setError("");
    setSuccess(null); // Reset success

    try {
      const response = await api.put(`/profiles/${user.id}`, {
        id: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl // Keep avatarUrl in the put request for consistency, though it's handled by separate upload
      });

      if (response.data.success) {
        setSuccess("Profile updated successfully!"); 
        updateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          avatarUrl: formData.avatarUrl,
        });
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false); // Changed setIsLoading to setLoading
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden group">
      <div className="p-8 border-b border-zinc-100 bg-zinc-50 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors" />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 leading-none">Basic <span className="text-amber-500">Information</span></h2>
          <p className="text-zinc-500 text-xs font-medium mt-1">Manage your public presence and contact details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        
        <ErrorAlert error={error} title="Update Required" />
        <SuccessAlert message={success} onClear={() => setSuccess(null)} />

        {/* Avatar Upload */}
      <div className="flex justify-center mb-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={40} className="text-neutral-300" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 group/input">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5 group/input">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5 group/input">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
          <PhoneInput
            international
            defaultCountry="VN"
            value={formData.phoneNumber}
            onChange={(value: string | undefined) => setFormData({ ...formData, phoneNumber: value || "" })}
            className="phone-input-container"
          />
        </div>

        <style jsx global>{`
          .phone-input-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            width: 100%;
          }
          .phone-input-container .PhoneInputInput {
            flex: 1;
            background-color: #f9f9fb; /* zinc-50 */
            border: 1px solid #e4e4e7; /* zinc-200 */
            border-radius: 1rem; /* rounded-2xl */
            padding: 0.875rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: #18181b; /* zinc-900 */
            transition: all 0.2s;
            outline: none;
          }
          .phone-input-container .PhoneInputInput:focus {
            border-color: #f59e0b; /* amber-500 */
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
          }
          .phone-input-container .PhoneInputCountry {
             background-color: #f9f9fb;
             border: 1px solid #e4e4e7;
             padding: 0.5rem 0.75rem;
             border-radius: 1rem;
             display: flex;
             align-items: center;
             height: 3.25rem;
             transition: all 0.2s;
          }
          .phone-input-container .PhoneInputCountry:hover {
             border-color: #d4d4d8;
          }
          .phone-input-container .PhoneInputCountrySelect {
             cursor: pointer;
          }
        `}</style>



        <div className="pt-8 border-t border-zinc-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-black uppercase tracking-tighter py-4 px-8 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group text-sm"
          >
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
