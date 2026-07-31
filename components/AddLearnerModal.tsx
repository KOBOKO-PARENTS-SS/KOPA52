import React from 'react';

const AddLearnerModal = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 bg-opacity-50 font-sans">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
              {/* Icon Placeholder */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Learner</h2>
              <p className="text-sm text-gray-500">Register a new student under the Lower Secondary curriculum.</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4">
          
          {/* LIN */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Learner Identification Number (LIN) (Optional)</label>
            <input type="text" placeholder="e.g. LIN-2024-8901" className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* First Name & Last Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">First Name *</label>
              <input type="text" placeholder="e.g. Emmanuel" required className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Last Name *</label>
              <input type="text" placeholder="e.g. Okello" required className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Other Names */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Other Name(s) (Optional)</label>
            <input type="text" placeholder="e.g. James" className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* Gender & Class */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Gender *</label>
              <select required className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Class *</label>
              <select required className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="S1">Senior 1 (S1)</option>
                <option value="S2">Senior 2 (S2)</option>
                <option value="S3">Senior 3 (S3)</option>
                <option value="S4">Senior 4 (S4)</option>
              </select>
            </div>
          </div>

          {/* Stream */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Stream (Optional)</label>
            <input type="text" placeholder="e.g. A" className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm">
              Save Learner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLearnerModal;