import AddLearnerForm from '@/components/AddLearnerModal';

export default function AddLearnerPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learner Management</h1>
          <p className="text-sm text-gray-600">Register a new learner into the database.</p>
        </div>

        <AddLearnerForm />
      </div>
    </main>
  );
}