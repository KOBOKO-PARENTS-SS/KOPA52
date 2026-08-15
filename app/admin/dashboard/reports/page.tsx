'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabaseClient';
import { calculateNLSCGrade } from '@/lib/grading';
import { generateAutomatedComments } from '@/lib/comments';
import { ReportCardDocument, LearnerReportData } from '@/components/pdf/ReportCardPDF';
import { FileText, Download, Loader2, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReportCardGeneratorPage() {

  // Selection Filters
  const [selectedClass, setSelectedClass] = useState<string>('S.1');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);

  // Data States
  const [reportsData, setReportsData] = useState<LearnerReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchClassReportData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setReportsData([]);

    try {
      // 1. Fetch Learners for selected class
      const { data: learners, error: learnersError } = await supabase
        .from('learners')
        .select('id, lin, full_name')
        .eq('class_level', selectedClass)
        .order('full_name', { ascending: true });

      if (learnersError) throw learnersError;
      if (!learners || learners.length === 0) {
        setErrorMessage(`No learners found enrolled in ${selectedClass}.`);
        setIsLoading(false);
        return;
      }

      // 2. Fetch Grades for selected term/year
      const learnerIds = learners.map((l) => l.id);
      const { data: rawGrades, error: gradesError } = await supabase
        .from('grades')
        .select(`
          learner_id,
          ca_score,
          eoc_score,
          subjects ( name )
        `)
        .in('learner_id', learnerIds)
        .eq('year', selectedYear)
        .eq('term', selectedTerm);

      if (gradesError) throw gradesError;

      // 3. Compile report data structure per learner with explicit TypeScript typing
      const compiledReports: LearnerReportData[] = learners.map((learner) => {
        const studentGrades = (rawGrades || [])
          .filter((g: { learner_id: string }) => g.learner_id === learner.id)
          .map((g: { ca_score: number | null; eoc_score: number | null; subjects: unknown }) => {
            const ca = g.ca_score !== null ? Number(g.ca_score) : 0;
            const eoc = g.eoc_score !== null ? Number(g.eoc_score) : 0;
            const result = calculateNLSCGrade(ca, eoc, 20, 80);

            return {
              subject_name: (g.subjects as { name: string })?.name || 'Subject',
              ca_score: g.ca_score,
              eoc_score: g.eoc_score,
              total_score: result.totalScore,
              grade: result.grade,
              descriptor: result.descriptor,
            };
          });

        // Generate automated comments based on student performance
        const autoComments = generateAutomatedComments(studentGrades);

        return {
          school_name: 'Koboko Secondary School',
          school_address: 'P.O. Box 10, Koboko, Uganda',
          learner_name: learner.full_name,
          lin: learner.lin,
          class_level: selectedClass,
          year: selectedYear,
          term: selectedTerm,
          grades: studentGrades,
          class_teacher_comment: autoComments.classTeacherComment,
          headteacher_comment: autoComments.headteacherComment,
        };
      });

      setReportsData(compiledReports);
    } catch (err: unknown) {
      console.error('Report compilation error:', err);
      setErrorMessage('Failed to compile class report cards. Verify database connections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassReportData();
  }, [selectedClass, selectedYear, selectedTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Batch Report Card Generator</h1>
          <p className="text-sm text-slate-500">
            Generate and export NLSC-compliant A4 PDF academic performance reports.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Class Level</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="S.1">Senior 1 (S.1)</option>
              <option value="S.2">Senior 2 (S.2)</option>
              <option value="S.3">Senior 3 (S.3)</option>
              <option value="S.4">Senior 4 (S.4)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchClassReportData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh Data'}
        </button>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Learner Roster & Action List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Class Enrolled Learners ({reportsData.length})</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm">Compiling marks and preparing PDF structures...</p>
          </div>
        ) : reportsData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">No report card records available for this selection.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reportsData.map((report, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{report.learner_name}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                      LIN: {report.lin}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex gap-3">
                    <span>Subjects Evaluated: {report.grades.length}</span>
                    <span>•</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </span>
                  </div>
                </div>

                {/* Single PDF Export Button */}
                <PDFDownloadLink
                  document={<ReportCardDocument data={report} />}
                  fileName={`Report_${report.lin}_${report.class_level}_T${report.term}.pdf`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                >
                  {({ loading }) => (
                    <>
                      {loading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>Export A4 PDF</span>
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}