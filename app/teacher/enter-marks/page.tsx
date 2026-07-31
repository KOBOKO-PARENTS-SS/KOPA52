'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateNLSCGrade } from '@/lib/grading';

// 1. Explicit TypeScript Interfaces
interface Learner {
  id: string | number;
  first_name: string;
  last_name: string;
  lin: string;
}

interface Subject {
  id: string | number;
  name: string;
  subject_code: string;
}

interface StatusMessage {
  type: 'success' | 'error' | '';
  text: string;
}

export default function EnterMarksPage() {
  // Explicitly type empty state arrays and message object
  const [learners, setLearners] = useState<Learner[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form state
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [year, setYear] = useState<string>('2026');
  const [term, setTerm] = useState<string>('1');
  const [caScore, setCaScore] = useState<string>('');
  const [eocScore, setEocScore] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<StatusMessage>({ type: '', text: '' });

  // Reset form inputs
  const handleCancel = () => {
    setSelectedLearner('');
    setSelectedSubject('');
    setCaScore('');
    setEocScore('');
    setMessage({ type: '', text: '' });
  };

  // 1. Fetch Learners and Subjects from Supabase when the page loads
  useEffect(() => {
    async function fetchData() {
      const { data: learnersData } = await supabase
        .from('learners')
        .select('id, first_name, last_name, lin');
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, subject_code');

      if (learnersData) setLearners(learnersData as Learner[]);
      if (subjectsData) setSubjects(subjectsData as Subject[]);
    }
    fetchData();
  }, []);

  // 2. Submit and Save to Database with FormEvent typing
  const handleSaveGrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Calculate grade breakdown (20% CA, 80% EoC)
      const gradeResult = calculateNLSCGrade(Number(caScore), 20, Number(eocScore), 80);

      // Get current logged-in teacher ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in as a teacher to save grades.');
      }

      // Save to Supabase using UPSERT
      const { error } = await supabase
        .from('grades')
        .upsert(
          {
            learner_id: selectedLearner,
            subject_id: selectedSubject,
            teacher_id: user.id,
            year: Number(year),
            term: Number(term),
            ca_score: gradeResult.caContribution,  // Stored out of 20
            eoc_score: gradeResult.eocContribution, // Stored out of 80
          },
          { onConflict: 'learner_id, subject_id, year, term' } // Prevents duplicates
        );

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Grade successfully saved! Final Grade: ${gradeResult.grade} (${gradeResult.totalScore}%)`
      });

      // Clear input fields
      setCaScore('');
      setEocScore('');

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred while saving.';
      setMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md my-8">
<<<<<<< HEAD
      {/* Updated dark, visible header title */}
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Enter Student Grades (NLSC)</h2>
=======
      <h2 className="text-2xl font-bold mb-6 text-gray-600">Enter Student Grades (NLSC)</h2>
>>>>>>> e5d2a2a9c31288cf11fc9be8ec7d0695d9193762

      {message.text && (
        <div className={`p-4 mb-4 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-900 border border-green-200' : 'bg-red-100 text-red-900 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveGrade} className="space-y-4">
        {/* Learner Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-800">Select Learner</label>
          <select
            value={selectedLearner}
            onChange={(e) => setSelectedLearner(e.target.value)}
            className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Choose Learner --</option>
            {learners.map((l) => (
              <option key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.lin})</option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-800">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Choose Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.subject_code})</option>
            ))}
          </select>
        </div>

        {/* Year and Term Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-800">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
          </div>
        </div>

        {/* Continuous Assessment & End of Term Exam */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-800">CA Score (Out of 20)</label>
            <input
              type="number"
              step="0.1"
              max="20"
              value={caScore}
              onChange={(e) => setCaScore(e.target.value)}
              className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 15.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800">Exam Score (Out of 80)</label>
            <input
              type="number"
              step="0.1"
              max="80"
              value={eocScore}
              onChange={(e) => setEocScore(e.target.value)}
              className="w-full border border-slate-300 text-slate-900 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 68"
              required
            />
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Grade'}
          </button>
        </div>
      </form>
    </div>
  );
}
