import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

interface SubjectGrade {
  subject_name: string;
  ca_score: number | null; // out of 20
  eoc_score: number | null; // out of 80
  total_score: number;
  grade: string;
  descriptor: string;
  teacher_initials?: string;
}

export interface LearnerReportData {
  school_name: string;
  school_address: string;
  school_logo_url?: string;
  learner_name: string;
  lin: string;
  class_level: string;
  year: number;
  term: number;
  grades: SubjectGrade[];
  class_teacher_comment: string;
  headteacher_comment: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#0284c7',
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  schoolAddress: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    marginTop: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaText: {
    fontSize: 9,
  },
  metaBold: {
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    width: '100%',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  colSubject: { width: '30%', paddingLeft: 4 },
  colCa: { width: '12%', textAlign: 'center' },
  colEoc: { width: '12%', textAlign: 'center' },
  colTotal: { width: '12%', textAlign: 'center' },
  colGrade: { width: '10%', textAlign: 'center' },
  colDescriptor: { width: '24%', paddingLeft: 4 },
  
  gradeBadge: {
    fontFamily: 'Helvetica-Bold',
  },
  
  commentsContainer: {
    marginTop: 10,
    gap: 8,
  },
  commentBox: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  commentTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#334155',
    marginBottom: 3,
  },
  commentText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#475569',
  },
  
  signatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
  },
  signatureLine: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    textAlign: 'center',
    paddingTop: 4,
    fontSize: 8,
    color: '#64748b',
  },
});

export const ReportCardDocument: React.FC<{ data: LearnerReportData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {data.school_logo_url && <Image src={data.school_logo_url} style={styles.logo} />}
        <View style={styles.headerTextContainer}>
          <Text style={styles.schoolName}>{data.school_name}</Text>
          <Text style={styles.schoolAddress}>{data.school_address}</Text>
          <Text style={styles.reportTitle}>LOWER SECONDARY CURRICULUM REPORT CARD</Text>
        </View>
      </View>

      {/* Learner Info Meta Bar */}
      <View style={styles.metaGrid}>
        <Text style={styles.metaText}>
          <Text style={styles.metaBold}>Name: </Text>{data.learner_name}
        </Text>
        <Text style={styles.metaText}>
          <Text style={styles.metaBold}>LIN: </Text>{data.lin}
        </Text>
        <Text style={styles.metaText}>
          <Text style={styles.metaBold}>Class: </Text>{data.class_level}
        </Text>
        <Text style={styles.metaText}>
          <Text style={styles.metaBold}>Term: </Text>{data.term}, {data.year}
        </Text>
      </View>

      {/* Academic Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.colSubject}>Subject</Text>
          <Text style={styles.colCa}>CA (20%)</Text>
          <Text style={styles.colEoc}>EoC (80%)</Text>
          <Text style={styles.colTotal}>Total %</Text>
          <Text style={styles.colGrade}>Grade</Text>
          <Text style={styles.colDescriptor}>Descriptor</Text>
        </View>

        {data.grades.map((g, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colSubject}>{g.subject_name}</Text>
            <Text style={styles.colCa}>{g.ca_score !== null ? g.ca_score : '-'}</Text>
            <Text style={styles.colEoc}>{g.eoc_score !== null ? g.eoc_score : '-'}</Text>
            <Text style={[styles.colTotal, styles.metaBold]}>{g.total_score}%</Text>
            <Text style={[styles.colGrade, styles.gradeBadge]}>{g.grade}</Text>
            <Text style={styles.colDescriptor}>{g.descriptor}</Text>
          </View>
        ))}
      </View>

      {/* Comments Section */}
      <View style={styles.commentsContainer}>
        <View style={styles.commentBox}>
          <Text style={styles.commentTitle}>CLASS TEACHER'S COMMENT</Text>
          <Text style={styles.commentText}>"{data.class_teacher_comment || 'Satisfactory progress maintained.'}"</Text>
        </View>
        <View style={styles.commentBox}>
          <Text style={styles.commentTitle}>HEADTEACHER'S COMMENT</Text>
          <Text style={styles.commentText}>"{data.headteacher_comment || 'Promoted to next class.'}"</Text>
        </View>
      </View>

      {/* Signatures */}
      <View style={styles.signatureGrid}>
        <Text style={styles.signatureLine}>Class Teacher Signature</Text>
        <Text style={styles.signatureLine}>Headteacher Signature & Stamp</Text>
      </View>
    </Page>
  </Document>
);