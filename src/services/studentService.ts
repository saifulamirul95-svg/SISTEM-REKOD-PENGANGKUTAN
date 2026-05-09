import { Student, TransportStats } from '../types';
import { getInitialStudents } from '../data/initialStudents';

const STORAGE_KEY = 'student_transport_records';

const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Memory fallback to ensure app works in restrictive iframes (Google Sites)
const memoryStorage: Record<string, string> = {};

export const studentService = {
  getStudents: (): Student[] => {
    const storageAvailable = isLocalStorageAvailable();
    const stored = storageAvailable 
      ? localStorage.getItem(STORAGE_KEY)
      : memoryStorage[STORAGE_KEY];

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored students', e);
      }
    }
    
    const initial = getInitialStudents();
    if (storageAvailable) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } else {
      memoryStorage[STORAGE_KEY] = JSON.stringify(initial);
    }
    return initial;
  },

  updateStudent: (updatedStudent: Student): void => {
    const students = studentService.getStudents();
    const index = students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
      students[index] = updatedStudent;
      const data = JSON.stringify(students);
      
      if (isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEY, data);
      } else {
        memoryStorage[STORAGE_KEY] = data;
      }
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
