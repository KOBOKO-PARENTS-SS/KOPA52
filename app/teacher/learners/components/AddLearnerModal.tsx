"use client";

import React, { useState } from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Adjust path to your Supabase browser client

interface AddLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLearnerAdded?: () => void;
}

interface FormData {
  lin: string;
  fullName: string;
  gender: "Male" | "Female" | "";
  classLevel: string;
  stream: string;
}

interface FormErrors {
  lin?: string;
  fullName?: string;
  gender?: string;
  classLevel?: string;
}

export default function AddLearnerModal({
  isOpen,
  onClose,
  onLearnerAdded,
}: AddLearnerModalProps) {

  const [formData, setFormData] = useState<FormData>({
    lin: "",
    fullName: "",
    gender: "",
    classLevel: "S1",
    stream: "A",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Form Validation Logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // LIN Validation (Learner Identification Number)
    if (!formData.lin.trim()) {
      newErrors.lin = "Learner Identification Number (LIN) is required.";
    } else if (!/^[A-Z0-9-]{6,15}$/i.test(formData.lin.trim())) {
      newErrors.lin = "Enter a valid LIN (6-15 alphanumeric characters).";
    }

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Learner's full name is required.";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters long.";
    }

    // Gender Validation
    if (!formData.gender) {
      newErrors.gender = "Please select a gender.";
    }

    // Class Validation
    if (!formData.classLevel) {
      newErrors.classLevel = "Class level is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("learners").insert([
        {
          lin: formData.lin.trim().toUpperCase(),
          full_name: formData.fullName.trim(),
          gender: formData.gender,
          class_level: formData.classLevel,
          stream: formData.stream.trim(),
        },
      ]);

      if (error) throw error;

      // Reset form on success
      setFormData({
        lin: "",
        fullName: "",
        gender: "",
        classLevel: "S1",
        stream: "A",
      });

      if (onLearnerAdded) onLearnerAdded();
      onClose();
    } catch (err: any) {
      setSubmitError(
        err.message || "Failed to register learner. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Learner</h2>
              <p className="text-xs text-slate-500">
                Register a new student under the Lower Secondary curriculum.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 rounded-lg border border-red-200">
              {submitError}
            </div>
          )}

          {/* LIN Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Learner Identification Number (LIN) *
            </label>
            <input
              type="text"
              name="lin"
              value={formData.lin}
              onChange={handleChange}
              placeholder="e.g. LIN-2024-8901"
              className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.lin
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-300 focus:ring-indigo-500"
              }`}
            />
            {errors.lin && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.lin}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Okello Emmanuel"
              className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? "border-red-300 focus:ring-red-500"
                  : "border-slate-300 focus:ring-indigo-500"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Gender & Class Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.gender
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.gender}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Class *
              </label>
              <select
                name="classLevel"
                value={formData.classLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="S1">Senior 1 (S1)</option>
                <option value="S2">Senior 2 (S2)</option>
                <option value="S3">Senior 3 (S3)</option>
                <option value="S4">Senior 4 (S4)</option>
              </select>
            </div>
          </div>

          {/* Stream */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Stream (Optional)
            </label>
            <input
              type="text"
              name="stream"
              value={formData.stream}
              onChange={handleChange}
              placeholder="e.g. North, Blue, or A"
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Learner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}