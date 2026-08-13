import * as XLSX from 'xlsx';
import { PayrollRecord } from '../types';
import { calculatePayrollRow } from './calculations';

export const EXACT_PAYROLL_HEADERS = [
  'S.N.',
  'CARD NO',
  'CLIENT COMPANY',
  'UAN',
  'ESIC',
  'NAME',
  'DAYS',
  'HRS',
  'PH',
  'RATE',
  'SALARY',
  'P.F.',
  'ESIC DED',
  'GWLF',
  'PT',
  'ADVANCE',
  'TRN',
  'R/R',
  'FOOD',
  'TOTAL DECTION',
  'NET SALARY',
  'A/C. NUMBER',
  'IFS CODE',
  'AGT',
  'DAYS (OT)',
  'RATE (OT)',
  'WAGES',
  'PF (EMPLOYER)',
  'TRN ALLOWANCE',
  'BONUS',
  'HRA',
  'LEAVE',
  'OT',
  'AMT'
];

export function exportPayrollToExcel(records: PayrollRecord[], fileName = 'Payroll_Data.xlsx') {
  const dataRows = records.map((r, idx) => [
    idx + 1,
    r.cardNo,
    r.clientCompany || 'PARISHRAM ENTERPRISES',
    r.uan,
    r.esicNo,
    r.name,
    r.days,
    r.hrs,
    r.ph,
    r.rate,
    r.salary,
    r.pf,
    r.esic,
    r.gwlf,
    r.pt,
    r.advance,
    r.trn,
    r.rr,
    r.food,
    r.totalDeduction,
    r.netSalary,
    r.accountNumber,
    r.ifscCode,
    r.agt,
    r.otDays,
    r.otRate,
    r.wages,
    r.employerPf,
    r.trnAllowance,
    r.bonus,
    r.hra,
    r.leaveEncashment,
    r.otPay,
    r.amt
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([EXACT_PAYROLL_HEADERS, ...dataRows]);
  
  // Set column widths for clean readability
  worksheet['!cols'] = EXACT_PAYROLL_HEADERS.map(h => ({ wch: Math.max(h.length + 4, 12) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Data');

  XLSX.writeFile(workbook, fileName);
}

export function downloadSampleExcel() {
  const sampleRows = [
    [
      1,
      'EMP-101',
      'WESTERN REFRIGERATION CO. LTD.',
      '100987654321',
      '3100456789001',
      'Rajesh Kumar Verma',
      25,
      200,
      1,
      850,
      22100,
      2652,
      180,
      10,
      200,
      1000,
      0,
      800,
      500,
      5342,
      21608,
      '918020034123',
      'SBIN0001234',
      'AGT-NORTH',
      3,
      1000,
      850,
      2873,
      0,
      1500,
      2500,
      850,
      3000,
      26950
    ],
    [
      2,
      'EMP-102',
      'WESTERN REFRIGERATION CO. LTD.',
      '100987654322',
      '3100456789002',
      'Priya Sharma',
      26,
      208,
      1,
      920,
      24840,
      2981,
      200,
      10,
      200,
      0,
      0,
      0,
      400,
      3791,
      26249,
      '501002345678',
      'HDFC0000123',
      'AGT-NORTH',
      2,
      1100,
      920,
      3229,
      0,
      2000,
      3000,
      0,
      2200,
      30040
    ]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([EXACT_PAYROLL_HEADERS, ...sampleRows]);
  worksheet['!cols'] = EXACT_PAYROLL_HEADERS.map(h => ({ wch: Math.max(h.length + 4, 12) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Template');

  XLSX.writeFile(workbook, 'Sample_Payroll_Import_Template.xlsx');
}

export function parseExcelOrCsvFile(file: File): Promise<PayrollRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonRows.length < 2) {
          resolve([]);
          return;
        }

        // Header mapping
        const headers: string[] = jsonRows[0].map((h: any) => String(h || '').trim().toUpperCase());
        
        const records: PayrollRecord[] = [];

        for (let i = 1; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0 || !row[1] && !row[4]) continue; // skip empty rows

          const getValue = (primaryName: string, altNames: string[] = []) => {
            let idx = headers.indexOf(primaryName.toUpperCase());
            if (idx === -1) {
              for (const alt of altNames) {
                idx = headers.indexOf(alt.toUpperCase());
                if (idx !== -1) break;
              }
            }
            if (idx !== -1 && row[idx] !== undefined) {
              return row[idx];
            }
            return undefined;
          };

          const cardNo = String(getValue('CARD NO', ['CARDNO', 'EMP ID', 'EMPLOYEE ID']) || `EMP-${100 + i}`);
          const clientCompany = String(getValue('CLIENT COMPANY', ['COMPANY', 'COMPANY NAME', 'CLIENT COMPANY / SITE', 'SITE', 'SITE LOCATION', 'CONTRACTOR SITE']) || 'PARISHRAM ENTERPRISES');
          const name = String(getValue('NAME', ['EMPLOYEE NAME', 'FULL NAME']) || `Employee ${i}`);
          const uan = String(getValue('UAN', ['UAN NUMBER', 'UAN NO']) || '');
          const esicNo = String(getValue('ESIC', ['ESIC NO', 'ESIC NUMBER']) || '');
          const days = Number(getValue('DAYS', ['PRESENT DAYS', 'WORKING DAYS']) || 26);
          const hrs = Number(getValue('HRS', ['HOURS']) || days * 8);
          const ph = Number(getValue('PH', ['HOLIDAYS']) || 0);
          const rate = Number(getValue('RATE', ['PER DAY RATE', 'DAILY RATE', 'WAGES']) || 800);
          const advance = Number(getValue('ADVANCE', ['ADVANCE DEDUCTION']) || 0);
          const food = Number(getValue('FOOD', ['FOOD DEDUCTION']) || 0);
          const rr = Number(getValue('R/R', ['ROOM RENT', 'RENT']) || 0);
          const trn = Number(getValue('TRN', ['TRANSPORT DEDUCTION']) || 0);
          const accountNumber = String(getValue('A/C. NUMBER', ['ACCOUNT NUMBER', 'AC NO', 'A/C NO']) || '');
          const ifscCode = String(getValue('IFS CODE', ['IFSC', 'IFSC CODE']) || '');
          const agt = String(getValue('AGT', ['AGENT', 'DEPARTMENT', 'CONTRACTOR']) || 'GENERAL');
          const otDays = Number(getValue('DAYS (OT)', ['OT DAYS', 'OVERTIME DAYS']) || 0);
          const otRate = Number(getValue('RATE (OT)', ['OT RATE', 'OVERTIME RATE']) || rate * 1.25);
          const bonus = Number(getValue('BONUS') || 0);
          const hra = Number(getValue('HRA', ['HOUSE RENT']) || 0);
          const leaveEncashment = Number(getValue('LEAVE', ['LEAVE ENCASHMENT']) || 0);

          const record = calculatePayrollRow({
            sn: i,
            cardNo,
            clientCompany,
            uan,
            esicNo,
            name,
            days,
            hrs,
            ph,
            rate,
            advance,
            food,
            rr,
            trn,
            accountNumber,
            ifscCode,
            agt,
            otDays,
            otRate,
            bonus,
            hra,
            leaveEncashment
          });

          records.push(record);
        }

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
