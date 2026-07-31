'use client';

import React, { useEffect } from 'react';
import { useActionState } from 'react';
import { addLearner, FormState } from '@/app/actions/learners';

interface AddLearnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLearnerAdded: () => Promise<void> | void;
}

const initialState: FormState = {
  success: false,
  error: null,
};

export default function AddLearnerModal({
  isOpen,
  onClose,
  onLearnerAdded,
}: AddLearnerModalProps) {
  const [state, formAction, isPending] = useActionState(addLearner, initialState);

  // Trigger parent refresh and auto-close modal on success
  useEffect(() => {
    if (state?.success) {
      onLearnerAdded();
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, onLearnerAdded, onClose]);

  // Return null if the modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Add New Learner</h2>

        {/* Alert Messages */}
        {state?.error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
            Learner successfully added!
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                placeholder="e.g. John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                placeholder="e.g. Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="learnerCode" className="block text-sm font-medium text-gray-700 mb-1">
              Learner ID / Registration No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="learnerCode"
              name="learnerCode"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
              placeholder="e.g. LRN-2026-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade / Level
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                placeholder="e.g. Grade 10"
              />
            </div>

            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                Class / Stream
              </label>
              <input
                type="text"
                id="className"
                name="className"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                placeholder="e.g. Room 10-A"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 text-sm"
            >
              {isPending ? 'Saving...' : 'Add Learner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}