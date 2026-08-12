import { EmployeeForm, PayrollRecord } from '../types';
import { calculatePayrollRow } from './calculations';

export interface SqlImportResult {
  employees: EmployeeForm[];
  payrollRecords: PayrollRecord[];
  rawStatementsCount: number;
  errors: string[];
}

/**
 * Robust SQL INSERT statement parser for Employee Registration and Payroll SQL Dumps
 */
export function parseSqlDump(sqlContent: string): SqlImportResult {
  const employees: EmployeeForm[] = [];
  const payrollRecords: PayrollRecord[] = [];
  const errors: string[] = [];

  if (!sqlContent || !sqlContent.trim()) {
    return { employees, payrollRecords, rawStatementsCount: 0, errors: ['SQL file content is empty.'] };
  }

  // Sanitize SQL content (remove comments)
  const cleanSql = sqlContent
    .replace(/--.*$/gm, '') // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ''); // block comments

  // Split into statements by semicolon
  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let parsedCount = 0;

  statements.forEach((stmt, index) => {
    // Regex to match INSERT INTO statements
    // Matches: INSERT INTO `tableName` (`col1`, `col2`, ...) VALUES (...)
    const insertRegex = /INSERT\s+INTO\s+[`"']?([a-zA-Z0-9_\-]+)[`"']?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i;
    const match = stmt.match(insertRegex);

    if (!match) {
      // Check if it's VALUES only or loose insert
      return;
    }

    parsedCount++;
    const tableName = match[1].toLowerCase();
    const columnsStr = match[2];
    const valuesChunk = match[3];

    // Extract column list
    const columns = columnsStr
      .split(',')
      .map((c) => c.replace(/[`"'\s]/g, '').trim());

    // Parse values list: handles tuples like ('val1', 'val2', 123), ('val3', 'val4', 456)
    const tuples = parseSqlValuesTuples(valuesChunk);

    tuples.forEach((rowValues, rIdx) => {
      // Map columns to values
      const rowObj: Record<string, any> = {};
      columns.forEach((col, cIdx) => {
        rowObj[col.toLowerCase()] = rowValues[cIdx] !== undefined ? rowValues[cIdx] : '';
      });

      // Determine entity type based on table name or key column presence
      const isPayroll =
        tableName.includes('pay') ||
        tableName.includes('salary') ||
        'days' in rowObj ||
        'netsalary' in rowObj ||
        'clientcompany' in rowObj;

      const isEmployee =
        tableName.includes('emp') ||
        tableName.includes('worker') ||
        tableName.includes('staff') ||
        'fullname' in rowObj ||
        'fathername' in rowObj ||
        'sitelocation' in rowObj;

      const cardNo =
        rowObj.cardno || rowObj.card_no || rowObj.empid || rowObj.emp_id || rowObj.sn || `${Date.now()}_${rIdx}`;
      const name =
        rowObj.fullname || rowObj.full_name || rowObj.name || rowObj.empname || rowObj.emp_name || 'Worker Name';

      const uan = rowObj.uan || '';
      const esicNo = rowObj.esicno || rowObj.esic_no || rowObj.esic || '';
      const accountNumber = rowObj.accountnumber || rowObj.account_number || rowObj.acc_no || rowObj.bankacc || '';
      const ifscCode = rowObj.ifsccode || rowObj.ifsc_code || rowObj.ifsc || '';
      const company =
        rowObj.sitelocation ||
        rowObj.site_location ||
        rowObj.clientcompany ||
        rowObj.client_company ||
        rowObj.company ||
        'SOHONI METALS PVT LTD';

      // 1. Construct Employee Form item
      const empRecord: EmployeeForm = {
        id: `sql_emp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        cardNo: String(cardNo).trim(),
        fullName: String(name).trim(),
        fatherName: rowObj.fathername || rowObj.father_name || '',
        fatherOrSpouseName: rowObj.fatherorspousename || rowObj.father_name || '',
        dob: rowObj.dob || rowObj.date_of_birth || '1990-01-01',
        gender: rowObj.gender || 'Male',
        category: rowObj.category || 'Skilled',
        phone: rowObj.phone || rowObj.mobile || '',
        email: rowObj.email || '',
        presentAddress: rowObj.presentaddress || rowObj.present_address || rowObj.address || '',
        permAddress: rowObj.permaddress || rowObj.perm_address || rowObj.address || '',
        address: rowObj.address || '',
        emergencyContact: rowObj.emergencycontact || rowObj.emergency_contact || '',
        bloodGroup: rowObj.bloodgroup || rowObj.blood_group || 'O+',
        joiningDate: rowObj.joiningdate || rowObj.joining_date || new Date().toISOString().split('T')[0],
        department: rowObj.department || 'Production',
        designation: rowObj.designation || 'Operator',
        agt: rowObj.agt || 'PARISHRAM-01',
        uan: String(uan).trim(),
        esicNo: String(esicNo).trim(),
        accountNumber: String(accountNumber).trim(),
        ifscCode: String(ifscCode).trim(),
        bankName: rowObj.bankname || rowObj.bank_name || 'State Bank of India',
        baseRate: Number(rowObj.baserate || rowObj.base_rate || rowObj.rate || 850),
        bonus: Number(rowObj.bonus || 0),
        hraRate: Number(rowObj.hrarate || rowObj.hra || 0),
        totalComp: Number(rowObj.totalcomp || 0),
        nomineeName: rowObj.nomineename || rowObj.nominee_name || '',
        nomineePhone: rowObj.nomineephone || rowObj.nominee_phone || '',
        siteLocation: String(company).trim().toUpperCase(),
        photoUrl: rowObj.photourl || rowObj.photo_url || '',
        documents: [],
        createdAt: new Date().toISOString().split('T')[0],
      };

      employees.push(empRecord);

      // 2. Construct Payroll Record item
      const days = Number(rowObj.days || rowObj.days_worked || 26);
      const rate = Number(rowObj.rate || rowObj.baserate || rowObj.daily_rate || 850);
      const hrs = Number(rowObj.hrs || rowObj.hours || days * 8);

      const payrollRow = calculatePayrollRow({
        sn: payrollRecords.length + 1,
        cardNo: String(cardNo).trim(),
        uan: String(uan).trim(),
        esicNo: String(esicNo).trim(),
        name: String(name).trim(),
        days: days,
        hrs: hrs,
        ph: Number(rowObj.ph || rowObj.public_holidays || 0),
        rate: rate,
        advance: Number(rowObj.advance || 0),
        food: Number(rowObj.food || 0),
        rr: Number(rowObj.rr || rowObj.room_rent || 0),
        accountNumber: String(accountNumber).trim(),
        ifscCode: String(ifscCode).trim(),
        agt: rowObj.agt || 'PARISHRAM-01',
        otDays: Number(rowObj.otdays || rowObj.ot_days || 0),
        otRate: Number(rowObj.otrate || rowObj.ot_rate || rate * 1.25),
        bonus: Number(rowObj.bonus || 0),
        hra: Number(rowObj.hra || 0),
        leaveEncashment: Number(rowObj.leaveencashment || rowObj.leave_encashment || 0),
        department: rowObj.department || 'Production',
        designation: rowObj.designation || 'Operator',
        clientCompany: String(company).trim().toUpperCase(),
      });

      payrollRecords.push(payrollRow);
    });
  });

  return {
    employees,
    payrollRecords,
    rawStatementsCount: parsedCount,
    errors,
  };
}

/**
 * Helper to extract tuples from SQL VALUES (...) syntax safely
 */
function parseSqlValuesTuples(valuesString: string): any[][] {
  const tuples: any[][] = [];
  let inTuple = false;
  let inQuotes = false;
  let quoteChar = '';
  let currentVal = '';
  let currentTuple: any[] = [];

  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    const prevChar = i > 0 ? valuesString[i - 1] : '';

    if (inQuotes) {
      if (char === quoteChar && prevChar !== '\\') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (char === '(' && !inTuple) {
      inTuple = true;
      currentTuple = [];
      currentVal = '';
      continue;
    }

    if (char === ')' && inTuple) {
      currentTuple.push(cleanParsedValue(currentVal));
      tuples.push(currentTuple);
      inTuple = false;
      currentTuple = [];
      currentVal = '';
      continue;
    }

    if (char === ',' && inTuple) {
      currentTuple.push(cleanParsedValue(currentVal));
      currentVal = '';
      continue;
    }

    if (inTuple) {
      currentVal += char;
    }
  }

  return tuples;
}

function cleanParsedValue(val: string): any {
  const trimmed = val.trim();
  if (trimmed.toUpperCase() === 'NULL') return '';
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, '');
}
