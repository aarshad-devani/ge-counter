import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  arrayUnion,
  setDoc,
  getDoc,
  increment,
  // query,
  // where,
  // serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Area, LogEntry, AreaAudit, AdminUser, VolunteerUser } from "../types";

// Areas collection operations
export const areasCollection = collection(db, "areas");
export const auditsCollection = collection(db, "audits");
export const adminsCollection = collection(db, "admins");
export const volunteersCollection = collection(db, "volunteers");

// Bootstrap admin emails for initial setup
// Add your email here to become the first admin
const BOOTSTRAP_ADMIN_EMAILS: string[] = [
  // 'your-email@example.com' // Uncomment and add your email
];

// Admin management
export const checkUserIsAdmin = async (
  userIdOrEmail: string
): Promise<boolean> => {
  try {
    console.log("🔍 checkUserIsAdmin called with:", userIdOrEmail);

    // Bootstrap admin check for initial setup
    if (BOOTSTRAP_ADMIN_EMAILS.includes(userIdOrEmail)) {
      console.log("🔍 Bootstrap admin found:", userIdOrEmail);
      return true;
    }

    // Try checking by the provided identifier (could be uid or email)
    let adminDoc = doc(db, "admins", userIdOrEmail);
    let adminSnapshot = await getDoc(adminDoc);

    console.log("🔍 First check exists:", adminSnapshot.exists());

    if (adminSnapshot.exists()) {
      const adminData = adminSnapshot.data() as AdminUser;
      console.log("🔍 Admin data found:", adminData);
      const isActive = adminData.status === "active";
      console.log("🔍 Admin status active:", isActive);
      return isActive;
    }

    console.log("🔍 No admin document found for:", userIdOrEmail);
    return false;
  } catch (error) {
    console.error("❌ Error checking admin status:", error);
    return false;
  }
};

// Volunteer management
export const checkUserIsVolunteer = async (
  userIdOrEmail: string
): Promise<boolean> => {
  try {
    console.log("🔍 checkUserIsVolunteer called with:", userIdOrEmail);

    const volunteerDoc = doc(db, "volunteers", userIdOrEmail);
    const volunteerSnapshot = await getDoc(volunteerDoc);

    console.log("🔍 Volunteer check exists:", volunteerSnapshot.exists());

    if (volunteerSnapshot.exists()) {
      const volunteerData = volunteerSnapshot.data() as VolunteerUser;
      console.log("🔍 Volunteer data found:", volunteerData);
      const isActive =
        volunteerData.status === "active" &&
        volunteerData.permissions.canAccessTicker;
      console.log(
        "🔍 Volunteer status active and can access ticker:",
        isActive
      );
      return isActive;
    }

    console.log("🔍 No volunteer document found for:", userIdOrEmail);
    return false;
  } catch (error) {
    console.error("❌ Error checking volunteer status:", error);
    return false;
  }
};

export const addAdmin = async (
  userEmail: string,
  _addedByUserId: string,
  addedByEmail: string
): Promise<void> => {
  // Note: In a real implementation, you'd need to get the user's UID from their email
  // This is a simplified version that uses email as the document ID
  const adminDoc = doc(db, "admins", userEmail);

  await setDoc(adminDoc, {
    email: userEmail,
    addedAt: new Date().toISOString(),
    addedBy: addedByEmail,
    status: "active",
  });
};

export const getAdmins = async (): Promise<AdminUser[]> => {
  const snapshot = await getDocs(adminsCollection);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as AdminUser[];
};

export const removeAdmin = async (adminId: string): Promise<void> => {
  const adminDoc = doc(db, "admins", adminId);
  await updateDoc(adminDoc, {
    status: "inactive",
  });
};

// Volunteer management functions
export const addVolunteer = async (
  userEmail: string,
  _addedByUserId: string,
  addedByEmail: string,
  assignedAreas?: string[]
): Promise<void> => {
  const volunteerDoc = doc(db, "volunteers", userEmail);

  await setDoc(volunteerDoc, {
    email: userEmail,
    addedAt: new Date().toISOString(),
    addedBy: addedByEmail,
    status: "active",
    permissions: {
      canAccessTicker: true,
      assignedAreas: assignedAreas || [], // Empty array means access to all areas
    },
  });
};

export const getVolunteers = async (): Promise<VolunteerUser[]> => {
  const snapshot = await getDocs(volunteersCollection);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as VolunteerUser[];
};

export const removeVolunteer = async (volunteerId: string): Promise<void> => {
  const volunteerDoc = doc(db, "volunteers", volunteerId);
  await updateDoc(volunteerDoc, {
    status: "inactive",
  });
};

export const updateVolunteer = async (
  volunteerId: string,
  updates: Partial<VolunteerUser>
): Promise<void> => {
  const volunteerDoc = doc(db, "volunteers", volunteerId);
  await updateDoc(volunteerDoc, updates);
};

// Areas operations
export const addArea = async (
  name: string,
  maxCapacity: number,
  _userId: string,
  userEmail: string
): Promise<string> => {
  const areaData = {
    name,
    maxCapacity,
    currentCount: 0,
    status: "enabled",
    createdAt: new Date().toISOString(),
    createdBy: userEmail,
  };

  const docRef = await addDoc(areasCollection, areaData);

  // Initialize audit document for this area
  const auditDoc = doc(db, "audits", docRef.id);
  await setDoc(auditDoc, {
    areaId: docRef.id,
    areaName: name,
    logEntries: [],
    lastUpdated: new Date().toISOString(),
  });

  return docRef.id;
};

export const updateArea = async (
  id: string,
  updates: Partial<Area>
): Promise<void> => {
  const areaDoc = doc(db, "areas", id);
  await updateDoc(areaDoc, updates);

  // Update area name in audit document if name changed
  if (updates.name) {
    const auditDoc = doc(db, "audits", id);
    await updateDoc(auditDoc, {
      areaName: updates.name,
      lastUpdated: new Date().toISOString(),
    });
  }
};

export const deleteArea = async (id: string): Promise<void> => {
  // Delete area document
  const areaDoc = doc(db, "areas", id);
  await deleteDoc(areaDoc);

  // Delete corresponding audit document
  const auditDoc = doc(db, "audits", id);
  await deleteDoc(auditDoc);
};

export const getAreas = async (): Promise<Area[]> => {
  const snapshot = await getDocs(areasCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Area[];
};

export const subscribeToAreas = (callback: (areas: Area[]) => void) => {
  return onSnapshot(areasCollection, (snapshot) => {
    const areas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Area[];
    callback(areas);
  });
};

export const subscribeToArea = (
  areaId: string,
  callback: (area: Area | null) => void
) => {
  const areaDoc = doc(db, "areas", areaId);
  return onSnapshot(areaDoc, (snapshot) => {
    if (snapshot.exists()) {
      const area = {
        id: snapshot.id,
        ...snapshot.data(),
      } as Area;
      callback(area);
    } else {
      callback(null);
    }
  });
};

export const incrementAreaCount = async (areaId: string): Promise<void> => {
  const areaDoc = doc(db, "areas", areaId);
  await updateDoc(areaDoc, {
    currentCount: increment(1),
  });
};

export const decrementAreaCount = async (areaId: string): Promise<void> => {
  const areaDoc = doc(db, "areas", areaId);
  await updateDoc(areaDoc, {
    currentCount: increment(-1),
  });
};

export const clearLogEntries = async (areaId: string): Promise<void> => {
  const auditDoc = doc(db, "audits", areaId);
  await updateDoc(auditDoc, {
    logEntries: [], // Clear log entries
    lastUpdated: new Date().toISOString(),
  });
};

// Audit operations - Per area documents
export const addLogEntry = async (logEntry: LogEntry): Promise<void> => {
  const auditDoc = doc(db, "audits", logEntry.areaId);

  // Ensure the audit document exists
  // const docSnapshot = await getDoc(auditDoc);
  // if (!docSnapshot.exists()) {
  //   // Get area info to initialize audit document
  //   const areaDoc = doc(db, 'areas', logEntry.areaId);
  //   const areaSnapshot = await getDoc(areaDoc);
  //   const areaData = areaSnapshot.data() as Area;

  //   await setDoc(auditDoc, {
  //     areaId: logEntry.areaId,
  //     areaName: areaData?.name || 'Unknown Area',
  //     logEntries: [],
  //     lastUpdated: new Date().toISOString(),
  //   });
  // }

  // Add the log entry using arrayUnion
  await updateDoc(auditDoc, {
    logEntries: arrayUnion(logEntry),
    lastUpdated: new Date().toISOString(),
  });
};

export const getAreaLogEntries = async (
  areaId: string
): Promise<LogEntry[]> => {
  const auditDoc = doc(db, "audits", areaId);
  const snapshot = await getDoc(auditDoc);

  if (snapshot.exists()) {
    const data = snapshot.data() as AreaAudit;
    return data.logEntries || [];
  }

  return [];
};

export const subscribeToAreaLogEntries = (
  areaId: string,
  callback: (entries: LogEntry[]) => void
) => {
  const auditDoc = doc(db, "audits", areaId);
  return onSnapshot(auditDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as AreaAudit;
      callback(data.logEntries || []);
    } else {
      callback([]);
    }
  });
};

export const getAllAuditData = async (): Promise<AreaAudit[]> => {
  const snapshot = await getDocs(auditsCollection);
  return snapshot.docs.map((doc) => doc.data()) as AreaAudit[];
};

export const subscribeToAllAudits = (
  callback: (audits: AreaAudit[]) => void
) => {
  return onSnapshot(auditsCollection, (snapshot) => {
    const audits = snapshot.docs.map((doc) => doc.data()) as AreaAudit[];
    callback(audits);
  });
};
