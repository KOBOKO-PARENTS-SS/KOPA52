interface GradeSummary {
  total_score: number; // Changed from totalScore to total_score
  grade: string;
}

interface CommentResult {
  classTeacherComment: string;
  headteacherComment: string;
}

export function generateAutomatedComments(grades: GradeSummary[]): CommentResult {
  if (!grades || grades.length === 0) {
    return {
      classTeacherComment: 'No subject scores recorded for this term.',
      headteacherComment: 'Pending complete assessment submission.',
    };
  }

  // Updated property reference from totalScore to total_score
  const totalPercentage = grades.reduce((acc, curr) => acc + curr.total_score, 0);
  const averageScore = Math.round(totalPercentage / grades.length);

  const gradeCounts = grades.reduce(
    (acc, curr) => {
      acc[curr.grade] = (acc[curr.grade] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  let classTeacherComment = '';
  let headteacherComment = '';

  if (averageScore >= 80) {
    classTeacherComment =
      'An exceptional academic performance. Demonstrates thorough mastery of concepts across all subject areas.';
    headteacherComment =
      'Outstanding results! Maintain this high standard of discipline and academic excellence.';
  } else if (averageScore >= 65) {
    const strongSubjects = (gradeCounts['A'] || 0) + (gradeCounts['B'] || 0);
    classTeacherComment = `Consistently strong effort. Displays solid understanding in ${strongSubjects} key subjects with potential for higher output.`;
    headteacherComment =
      'Very good progress made this term. Focused revision will yield even better outcomes next term.';
  } else if (averageScore >= 50) {
    classTeacherComment =
      'Satisfactory performance overall, though continuous assessment scores indicate room for improvement in revision consistency.';
    headteacherComment =
      'Fair results. Recommended to put extra effort into core subjects to raise overall standing.';
  } else if (averageScore >= 35) {
    const strugglingCount = (gradeCounts['D'] || 0) + (gradeCounts['E'] || 0);
    classTeacherComment = `Struggling in ${strugglingCount} learning areas. Needs to engage more actively during continuous assessment activities.`;
    headteacherComment =
      'Below expected standard. Parent/guardian consultation is encouraged to plan remedial support.';
  } else {
    classTeacherComment =
      'Unsatisfactory results across most evaluation criteria. Immediate intervention and structured study habits required.';
    headteacherComment =
      'Serious concern regarding academic progress. Must attend targeted remedial classes next term.';
  }

  return {
    classTeacherComment,
    headteacherComment,
  };
}