import * as XLSX from 'xlsx';

export interface BulkScoreRow {
  lin: string;
  learner_name: string;
  ca_score: number | null;
  eoc_score: number | null;
}

// Generates an Excel template pre-populated with learners in a class/stream
export function exportScoreSheetTemplate(learners: { lin: string; full_name: string }[], subjectName: string) {
  const data = learners.map((l) => ({
    'LIN': l.lin,
    'Learner Name': l.full_name,
    'CA Score (Max 20)': '',
    'EoC Score (Max 80)': '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scores');
  
  XLSX.writeFile(workbook, `${subjectName.replace(/\s+/g, '_')}_Score_Sheet.xlsx`);
}

// Parses uploaded Excel file into structured JSON
export function parseUploadedScoreSheet(file: File): Promise<BulkScoreRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet);

        const parsed: BulkScoreRow[] = rawJson.map((row) => ({
          lin: String(row['LIN'] || '').trim(),
          learner_name: String(row['Learner Name'] || '').trim(),
          ca_score: row['CA Score (Max 20)'] !== undefined && row['CA Score (Max 20)'] !== '' ? Number(row['CA Score (Max 20)']) : null,
          eoc_score: row['EoC Score (Max 80)'] !== undefined && row['EoC Score (Max 80)'] !== '' ? Number(row['EoC Score (Max 80)']) : null,
        }));

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}