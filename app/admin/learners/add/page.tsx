'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddLearnerModal from '@/components/AddLearnerModal'; // Adjust import path if stored in @/components/learners/AddLearnerModal

export default function AddLearnerPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const handleLearnerAdded = async () => {
    // Refresh the current route data when a learner is successfully added
    router.refresh();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learner Management</h1>
          <p className="text-sm text-gray-600">Register a new learner into the database.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add New Learner
        </button>

        {/* Modal with required props passed explicitly */}
        <AddLearnerModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onLearnerAdded={handleLearnerAdded}
        />
      </div>
    </main>
  );
}