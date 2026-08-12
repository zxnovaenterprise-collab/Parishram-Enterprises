export interface PayrollRecord {
  id: string;
  sn: number;                  // S.N.
  cardNo: string;              // CARD NO
  uan: string;                 // UAN
  esicNo: string;              // ESIC
  name: string;                // NAME
  clientCompany?: string;      // Working Company / Contracted Client Site
  days: number;                // DAYS
  hrs: number;                 // HRS
  ph: number;                  // PH (Paid/Public Holiday)
  rate: number;                // RATE
  salary: number;              // SALARY (Earned Gross Basic)
  pf: number;                  // P.F. (Employee Deduction)
  esic: number;                // ESIC (Employee Deduction)
  gwlf: number;                // GWLF (Group/Labour Welfare Fund)
  pt: number;                  // PT (Professional Tax)
  advance: number;             // ADVANCE
  trn: number;                 // TRN (Transport deduction/allowance)
  rr: number;                  // R/R (Room / Rent)
  food: number;                // FOOD
  totalDeduction: number;      // TOTAL DECTION
  netSalary: number;           // NET SALARY
  accountNumber: string;       // A/C. NUMBER
  ifscCode: string;            // IFS CODE
  agt: string;                 // AGT (Agent / Department / Contractor)
  otDays: number;              // DAYS (OT days)
  otRate: number;              // RATE (OT rate)
  wages: number;               // WAGES (Base daily rate)
  employerPf: number;          // PF (Employer contribution)
  trnAllowance: number;        // TRN (Transport allowance)
  bonus: number;               // BONUS
  hra: number;                 // HRA
  leaveEncashment: number;     // LEAVE
  otPay: number;               // OT (Overtime amount)
  amt: number;                 // AMT (Total Gross Payable / Final Amount)
  monthYear: string;           // e.g. "2026-08"
  department: string;          // Department
  designation: string;         // Designation
}

export type DocumentType = 'Aadhaar Card' | 'PAN Card' | 'Profile Photo';

export interface DocumentUpload {
  type: DocumentType;
  frontImage: string | null;  // base64 data url
  backImage: string | null;   // base64 data url
  capturedAt: string | null;
  documentNumber?: string;
}

export interface EmployeeForm {
  id: string;
  cardNo: string;
  fullName: string;
  fatherName: string;
  fatherOrSpouseName?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  category: string;
  phone: string;
  email: string;
  presentAddress: string;
  permAddress: string;
  address?: string;
  emergencyContact: string;
  bloodGroup: string;
  joiningDate: string;
  department: string;
  designation: string;
  agt: string;
  uan: string;
  esicNo: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  baseRate: number;      // RATE
  bonus: number;         // BONUS
  hraRate: number;       // HRA
  totalComp: number;     // TOTAL
  nomineeName: string;
  nomineePhone: string;
  siteLocation: string;  // SITE / CLIENT COMPANY e.g. WESTERN REFRIGERATION PVT LTD
  photoUrl?: string;
  documents: DocumentUpload[];
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  companySubTitle: string;
  companySite: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGst: string;
  companyPan: string;
  companyLogo: string;
  signatoryName: string;
  signatoryDesignation: string;
  pfRatePercent: number;
  esicRatePercent: number;
  ptThreshold: number;
  ptAmount: number;
  standardMonthDays: number;
  clientCompanies: string[];  // List of client / contract companies
}

export type ActiveTab = 'dashboard' | 'payroll' | 'history' | 'form' | 'idcard' | 'settings';

export interface PayrollHistoryBatch {
  id: string;
  batchName: string;         // e.g. "July 2026 Payroll - Sohoni Metals"
  monthYear: string;         // e.g. "2026-08"
  clientCompany?: string;    // Optional contract site tag
  createdAt: string;         // ISO date timestamp
  totalEmployees: number;
  totalNetSalary: number;
  records: PayrollRecord[];  // Snapshotted list of payroll records
}

export interface PortalUser {
  id: string;
  username: string;       // Login User ID
  password: string;       // Password
  fullName: string;
  role: string;           // Designation / Role
  allowedTabs: ActiveTab[]; // Permissions
}


