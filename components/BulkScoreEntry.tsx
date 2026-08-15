'use client';

import React, { useState, useEffect } from 'react';
import { calculateNLSCGrade } from '@/lib/grading';
import { exportScoreSheetTemplate, parseUploadedScoreSheet } from '@/lib/excel';
import { Download, Upload, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StudentScoreItem {
  learner_id: string;
  lin: string;
  full_name: string;
  ca_score: string;
  eoc_score: string;
}

export default function BulkScoreEntry({
  subjectId,
  subjectName,
  classLevel,
  year = 2026,
  term = 1,
  learners,
}: {
  subjectId: string;
  subjectName: string;
  classLevel: string;
  year?: number;
  term?: number;
  learners: { id: string; lin: string; full_name: string }[];
}) {
  const [scores, setScores] = useState<StudentScoreItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const draftKey = `draft_scores_${subjectId}_${classLevel}_${year}_${term}`;

  // Load draft or initialize list
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        setScores(JSON.parse(savedDraft));
        return;
      } catch (e) {
        console.error('Failed to parse local draft', e);
      }
    }

    setScores(
      learners.map((l) => ({
        learner_id: l.id,
        lin: l.lin,
        full_name: l.full_name,
        ca_score: '',
        eoc_score: '',
      }))
    );
  }, [learners, draftKey]);

  const handleScoreChange = (learner_id: string, field: 'ca_score' | 'eoc_score', value: string) => {
    const updated = scores.map((s) => (s.learner_id === learner_id ? { ...s, [field]: value } : s));
    setScores(updated);
    localStorage.setItem(draftKey, JSON.stringify(updated));
    setSaveStatus('idle');
    setErrorMessage('');
  };

  const hasValidationErrors = scores.some((s) => {
    const ca = parseFloat(s.ca_score);
    const eoc = parseFloat(s.eoc_score);
    const isCaInvalid = s.ca_score !== '' && (!isNaN(ca) && (ca < 0 || ca > 20));
    const isEocInvalid = s.eoc_score !== '' && (!isNaN(eoc) && (eoc < 0 || eoc > 80));
    return isCaInvalid || isEocInvalid;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedRows = await parseUploadedScoreSheet(file);
      const updated = scores.map((item) => {
        const match = parsedRows.find((r) => r.lin === item.lin);
        if (match) {
          return {
            ...item,
            ca_score: match.ca_score !== null ? String(match.ca_score) : item.ca_score,
            eoc_score: match.eoc_score !== null ? String(match.eoc_score) : item.eoc_score,
          };
        }
        return item;
      });
      setScores(updated);
      localStorage.setItem(draftKey, JSON.stringify(updated));
    } catch {
      setErrorMessage('Error parsing uploaded file. Verify column headers.');
      setSaveStatus('error');
    }
  };

  const handleSaveToDatabase = async () => {
    if (hasValidationErrors) {
      setErrorMessage('Fix invalid scores marked in red before saving.');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    const { data: { user } } = await supabase.auth.getUser();

    const payload = scores
      .filter((s) => s.ca_score !== '' || s.eoc_score !== '')
      .map((s) => ({
        learner_id: s.learner_id,
        subject_id: subjectId,
        teacher_id: user?.id || null,
        year,
        term,
        ca_score: s.ca_score !== '' ? parseFloat(s.ca_score) : null,
        eoc_score: s.eoc_score !== '' ? parseFloat(s.eoc_score) : null,
      }));

    if (payload.length === 0) {
      setIsSaving(false);
      setErrorMessage('No scores were entered.');
      setSaveStatus('error');
      return;
    }

    const { error } = await supabase.from('grades').upsert(payload, {
      onConflict: 'learner_id,subject_id,year,term',
    });

    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message || 'Failed to save scores.');
      setSaveStatus('error');
    } else {
      setSaveStatus('saved');
      localStorage.removeItem(draftKey);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{subjectName} Mark Sheet</h2>
          <p className="text-sm text-slate-500">
            Class: {classLevel} | Term {term}, {year}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportScoreSheetTemplate(learners, subjectName)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" /> Download Template
          </button>

          <label className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition">
            <Upload className="w-4 h-4" /> Import Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving || hasValidationErrors}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save All Grades'}
          </button>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> All grades saved successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {errorMessage || 'An error occurred while saving.'}
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">LIN</th>
              <th className="p-3">Learner Name</th>
              <th className="p-3 w-32">CA (20%)</th>
              <th className="p-3 w-32">EoC (80%)</th>
              <th className="p-3 w-24">Total %</th>
              <th className="p-3 w-20">Grade</th>
              <th className="p-3">Descriptor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scores.map((row) => {
              const ca = parseFloat(row.ca_score);
              const eoc = parseFloat(row.eoc_score);

              const isCaInvalid = row.ca_score !== '' && (!isNaN(ca) && (ca < 0 || ca > 20));
              const isEocInvalid = row.eoc_score !== '' && (!isNaN(eoc) && (eoc < 0 || eoc > 80));

              // Fixed: Provided all required arguments to calculateNLSCGrade
              const result = calculateNLSCGrade(
                isNaN(ca) ? 0 : ca,
                isNaN(eoc) ? 0 : eoc,
                20,
                80
              );

              return (
                <tr key={row.learner_id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono text-xs text-slate-500">{row.lin}</td>
                  <td className="p-3 font-medium text-slate-800">{row.full_name}</td>

                  <td className="p-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0 - 20"
                      value={row.ca_score}
                      onChange={(e) => handleScoreChange(row.learner_id, 'ca_score', e.target.value)}
                      className={`w-full p-2 border rounded-md text-sm outline-none transition ${
                        isCaInvalid ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0 - 80"
                      value={row.eoc_score}
                      onChange={(e) => handleScoreChange(row.learner_id, 'eoc_score', e.target.value)}
                      className={`w-full p-2 border rounded-md text-sm outline-none transition ${
                        isEocInvalid ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  </td>

                  <td className="p-3 font-bold text-slate-700">{result.totalScore}%</td>
                  
                  {/* Fixed: Replaced result.letterGrade with result.grade */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        result.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : result.grade === 'B'
                          ? 'bg-blue-100 text-blue-800'
                          : result.grade === 'C'
                          ? 'bg-yellow-100 text-yellow-800'
                          : result.grade === 'D'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.grade}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-500 italic truncate max-w-xs">{result.descriptor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}