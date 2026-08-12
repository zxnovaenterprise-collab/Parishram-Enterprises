import { PayrollRecord } from '../types';

export function calculatePayrollRow(input: Partial<PayrollRecord>): PayrollRecord {
  const days = Number(input.days || 0);
  const rate = Number(input.rate || input.wages || 0);
  const hrs = Number(input.hrs || days * 8);
  const ph = Number(input.ph || 0);
  
  // Salary earned based on days worked + paid holidays
  const salary = Math.round((days + ph) * rate);
  
  const hra = Number(input.hra || 0);
  const bonus = Number(input.bonus || 0);
  const leaveEncashment = Number(input.leaveEncashment || 0);
  
  // Overtime
  const otDays = Number(input.otDays || 0);
  const otRate = Number(input.otRate || rate * 1.25);
  const otPay = Number(input.otPay || Math.round(otDays * otRate));

  const trnAllowance = Number(input.trnAllowance || 0);

  // Total Gross / Final Amount Payable (AMT)
  const amt = salary + hra + bonus + leaveEncashment + otPay + trnAllowance;

  // Deductions
  const pf = Number(input.pf !== undefined ? input.pf : Math.round(salary * 0.12));
  const esic = Number(input.esic !== undefined ? input.esic : Math.round(amt > 21000 ? 0 : amt * 0.0075));
  const gwlf = Number(input.gwlf || 10);
  const pt = Number(input.pt !== undefined ? input.pt : (salary > 15000 ? 200 : 0));
  const advance = Number(input.advance || 0);
  const trn = Number(input.trn || 0);
  const rr = Number(input.rr || 0);
  const food = Number(input.food || 0);

  const totalDeduction = pf + esic + gwlf + pt + advance + trn + rr + food;
  const netSalary = Math.max(0, amt - totalDeduction);

  const employerPf = Number(input.employerPf !== undefined ? input.employerPf : Math.round(salary * 0.13));

  return {
    id: input.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sn: Number(input.sn || 1),
    cardNo: input.cardNo || 'EMP-001',
    uan: input.uan || '101234567890',
    esicNo: input.esicNo || '3100123456001',
    name: input.name || 'John Doe',
    days,
    hrs,
    ph,
    rate,
    salary,
    pf,
    esic,
    gwlf,
    pt,
    advance,
    trn,
    rr,
    food,
    totalDeduction,
    netSalary,
    accountNumber: input.accountNumber || '918020030040',
    ifscCode: input.ifscCode || 'SBIN0001234',
    agt: input.agt || 'CONTRACT-A',
    otDays,
    otRate,
    wages: rate,
    employerPf,
    trnAllowance,
    bonus,
    hra,
    leaveEncashment,
    otPay,
    amt,
    monthYear: input.monthYear || '2026-08',
    department: input.department || 'Production',
    designation: input.designation || 'Operator',
  };
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  return inWords(Math.floor(num)).trim() + ' Rupees Only';
}
