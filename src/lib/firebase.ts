import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { EmployeeForm, PayrollRecord, CompanySettings } from '../types';

// Initialize Firebase App
export const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore targeting the specific database ID if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection references
const EMPLOYEES_COL = 'employees';
const PAYROLL_COL = 'payrollRecords';
const SETTINGS_COL = 'settings';

/**
 * Subscribe to real-time Employees stream
 */
export function subscribeEmployees(
  onUpdate: (employees: EmployeeForm[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, EMPLOYEES_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: EmployeeForm[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as EmployeeForm), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error in subscribeEmployees:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to real-time Payroll Records stream
 */
export function subscribePayrollRecords(
  onUpdate: (records: PayrollRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PAYROLL_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PayrollRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as PayrollRecord), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Error in subscribePayrollRecords:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to Company Settings document
 */
export function subscribeSettings(
  onUpdate: (settings: CompanySettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, SETTINGS_COL, 'company_config');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as CompanySettings);
      }
    },
    (err) => {
      console.error('Error in subscribeSettings:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update single Employee
 */
export async function saveEmployeeToFirestore(emp: EmployeeForm) {
  const empRef = doc(db, EMPLOYEES_COL, emp.id);
  await setDoc(empRef, emp, { merge: true });
}

/**
 * Save multiple Employees in batch
 */
export async function saveBatchEmployeesToFirestore(employees: EmployeeForm[]) {
  const batch = writeBatch(db);
  employees.forEach((emp) => {
    const ref = doc(db, EMPLOYEES_COL, emp.id);
    batch.set(ref, emp, { merge: true });
  });
  await batch.commit();
}

/**
 * Delete Employee
 */
export async function deleteEmployeeFromFirestore(empId: string) {
  const empRef = doc(db, EMPLOYEES_COL, empId);
  await deleteDoc(empRef);
}

/**
 * Save or update single Payroll Record
 */
export async function savePayrollRecordToFirestore(rec: PayrollRecord) {
  const recRef = doc(db, PAYROLL_COL, rec.id);
  await setDoc(recRef, rec, { merge: true });
}

/**
 * Save multiple Payroll Records in batch
 */
export async function saveBatchPayrollRecordsToFirestore(records: PayrollRecord[]) {
  const batch = writeBatch(db);
  records.forEach((rec) => {
    const ref = doc(db, PAYROLL_COL, rec.id);
    batch.set(ref, rec, { merge: true });
  });
  await batch.commit();
}

/**
 * Delete Payroll Record
 */
export async function deletePayrollRecordFromFirestore(recId: string) {
  const recRef = doc(db, PAYROLL_COL, recId);
  await deleteDoc(recRef);
}

/**
 * Save Company Settings
 */
export async function saveSettingsToFirestore(settings: CompanySettings) {
  const docRef = doc(db, SETTINGS_COL, 'company_config');
  await setDoc(docRef, settings, { merge: true });
}

/**
 * Ping Firestore connection to measure latency
 */
export async function pingFirestore(): Promise<number> {
  const start = Date.now();
  const pingRef = doc(db, 'system_health', 'ping');
  await setDoc(pingRef, { lastPing: new Date().toISOString() }, { merge: true });
  return Date.now() - start;
}

/**
 * Clear all collections in Firestore
 */
export async function clearFirestoreData() {
  // Clear settings
  await deleteDoc(doc(db, SETTINGS_COL, 'company_config'));
}

