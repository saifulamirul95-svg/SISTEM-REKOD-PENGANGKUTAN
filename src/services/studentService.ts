import { Student, TransportStats } from '../types';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  setDoc,
  query,
  limit
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_PATH = 'students';

export const studentService = {
  subscribeToStudents: (callback: (students: Student[]) => void) => {
    const q = query(collection(db, COLLECTION_PATH));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => doc.data() as Student);
      callback(students);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
    });
  },

  getStudentsOnce: async (): Promise<Student[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_PATH));
      return snapshot.docs.map(doc => doc.data() as Student);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
      return [];
    }
  },

  // Helper to seed initial data and add any missing records
  seedInitialData: async (initialStudents: Student[]) => {
    try {
      // For efficiency, we get all existing IDs to compare
      const snapshot = await getDocs(collection(db, COLLECTION_PATH));
      const existingIds = new Set(snapshot.docs.map(doc => doc.id));
      
      const studentsToAdd = initialStudents.filter(s => !existingIds.has(s.id));
      
      if (studentsToAdd.length > 0) {
        console.log(`Menambah ${studentsToAdd.length} rekod pelajar baharu ke Firestore...`);
        // We use a simple loop for safety
        for (const student of studentsToAdd) {
          await setDoc(doc(db, COLLECTION_PATH, student.id), student);
        }
      }
    } catch (error) {
      console.error('Gagal menyemak/menambah data awal', error);
    }
  },

  updateStudent: async (updatedStudent: Student): Promise<void> => {
    const studentRef = doc(db, COLLECTION_PATH, updatedStudent.id);
    try {
      await updateDoc(studentRef, {
        transportMode: updatedStudent.transportMode,
        hasLicense: updatedStudent.hasLicense,
        licenseType: updatedStudent.licenseType
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PATH}/${updatedStudent.id}`);
    }
  },

  getStats: (students: Student[]): TransportStats => {
    const totalStudents = students.length;
    let totalLicensed = 0;
    let motorcycleLicensed = 0;
    let carLicensed = 0;
    let recordedCount = 0;

    // Mode counts
    let motosikalCount = 0;
    let keretaCount = 0;
    let basikalCount = 0;
    let jalanKakiCount = 0;
    let dihantarPenjagaCount = 0;
    let basCount = 0;
    let lainLainCount = 0;

    // Licensing details
    let motosikalWithLicense = 0;
    let motosikalNoLicense = 0;
    let keretaWithLicense = 0;
    let keretaNoLicense = 0;

    // Grouping by class to track completion
    const classGroups: Record<string, { total: number; recorded: number }> = {};

    students.forEach(s => {
      // Identity stats (global license count)
      if (s.hasLicense) {
        totalLicensed++;
        if (s.licenseType === 'Motosikal (B2/B)') {
          motorcycleLicensed++;
        } else if (s.licenseType === 'Kereta (D/DA)') {
          carLicensed++;
        }
      }

      // Recording stats
      const isRecorded = s.transportMode !== 'Tiada';
      if (isRecorded) {
        recordedCount++;
        
        // Count modes
        if (s.transportMode === 'Motosikal') {
          motosikalCount++;
          if (s.hasLicense) motosikalWithLicense++;
          else motosikalNoLicense++;
        } else if (s.transportMode === 'Kereta') {
          keretaCount++;
          if (s.hasLicense) keretaWithLicense++;
          else keretaNoLicense++;
        } else if (s.transportMode === 'Basikal') {
          basikalCount++;
        } else if (s.transportMode === 'Jalan Kaki') {
          jalanKakiCount++;
        } else if (s.transportMode === 'Dihantar Penjaga') {
          dihantarPenjagaCount++;
        } else if (s.transportMode === 'Bas') {
          basCount++;
        } else {
          lainLainCount++;
        }
      }

      // Progress by class
      const classKey = `${s.form} ${s.className}`;
      if (!classGroups[classKey]) classGroups[classKey] = { total: 0, recorded: 0 };
      classGroups[classKey].total++;
      if (isRecorded) classGroups[classKey].recorded++;
    });

    const completedClasses = Object.entries(classGroups)
      .filter(([_, stats]) => stats.total === stats.recorded && stats.total > 0)
      .map(([name]) => name);

    return {
      totalStudents,
      totalLicensed,
      motorcycleLicensed,
      carLicensed,
      recordedCount,
      completedClasses,
      motosikalCount,
      keretaCount,
      basikalCount,
      jalanKakiCount,
      dihantarPenjagaCount,
      basCount,
      lainLainCount,
      motosikalWithLicense,
      motosikalNoLicense,
      keretaWithLicense,
      keretaNoLicense
    };
  }
};
