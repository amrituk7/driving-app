import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// 1. Load keys safely
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// 2. The "Safety Check"
const firebaseConfig = apiKey
  ? {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }
  : {};

// 3. Initialize ONLY if keys exist
let app, db, auth, storage;

if (apiKey) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  console.error("Firebase keys are missing! Check your v0 Environment Variables.");
}

export { app, db, auth, storage };

// --- AUTH ---

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase Auth is not available");
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // Check if profile already exists
  const existing = await getUserProfile(user.uid);
  if (!existing) {
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      role: "student",
      createdAt: Date.now(),
    });
  }
  return user;
};

export const registerUser = async (email, password, role = "student") => {
  if (!auth) throw new Error("Firebase Auth is not available");
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await addDoc(collection(db, "users"), {
    uid: user.uid,
    email: user.email,
    role,
    createdAt: Date.now(),
  });
  return user;
};

export const loginUser = async (email, password) => {
  if (!auth) throw new Error("Firebase Auth is not available");
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const getUserProfile = async (uid) => {
  if (!db) return null;
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
};

export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- STORAGE ---

export const uploadProfilePicture = async (studentId, file) => {
  const storageRef = ref(storage, `profile-pictures/${studentId}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateStudent(studentId, { profilePicture: url });
  return url;
};

export const deleteProfilePicture = async (studentId) => {
  try {
    const storageRef = ref(storage, `profile-pictures/${studentId}`);
    await deleteObject(storageRef);
  } catch {
    // File might not exist
  }
  await updateStudent(studentId, { profilePicture: null });
};

// --- STUDENTS ---

export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), studentData);
  return docRef.id;
};

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getStudent = async (id) => {
  const docRef = doc(db, "students", id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const updateStudent = async (id, data) => {
  const docRef = doc(db, "students", id);
  await updateDoc(docRef, data);
};

export const deleteStudent = async (id) => {
  try { await deleteProfilePicture(id); } catch { /* ignore */ }
  const docRef = doc(db, "students", id);
  await deleteDoc(docRef);
};

// --- LESSONS ---

export const addLesson = async (lessonData) => {
  const docRef = await addDoc(collection(db, "lessons"), {
    ...lessonData,
    timestamp: Date.now(),
  });
  return docRef.id;
};

export const getLessons = async () => {
  const snapshot = await getDocs(collection(db, "lessons"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getLessonsForStudent = async (studentId) => {
  const q = query(collection(db, "lessons"), where("studentId", "==", studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteLesson = async (id) => {
  const docRef = doc(db, "lessons", id);
  await deleteDoc(docRef);
};

// --- MESSAGES ---

export const sendMessage = async (message) => {
  const docRef = await addDoc(collection(db, "messages"), {
    ...message,
    timestamp: Date.now(),
  });
  return docRef.id;
};

export const getMessagesForStudent = async (studentId) => {
  const q = query(collection(db, "messages"), where("receiver", "==", studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// --- NOTIFICATIONS ---

export const sendNotification = async (notification) => {
  const docRef = await addDoc(collection(db, "notifications"), {
    ...notification,
    read: false,
    timestamp: Date.now(),
  });
  return docRef.id;
};

export const getNotifications = async () => {
  const snapshot = await getDocs(collection(db, "notifications"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const markNotificationRead = async (id) => {
  const docRef = doc(db, "notifications", id);
  await updateDoc(docRef, { read: true });
};

export const deleteNotification = async (id) => {
  const docRef = doc(db, "notifications", id);
  await deleteDoc(docRef);
};

// --- TIPS ---

export const addTip = async (tipData) => {
  const docRef = await addDoc(collection(db, "tips"), {
    ...tipData,
    timestamp: Date.now(),
  });
  return docRef.id;
};

export const getTips = async () => {
  const snapshot = await getDocs(collection(db, "tips"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteTip = async (id) => {
  const docRef = doc(db, "tips", id);
  await deleteDoc(docRef);
};
