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
  where
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBHAGf5NleYjckCad9mjr09_doR_5lce4Y",
  authDomain: "roadmaster-23cbc.firebaseapp.com",
  projectId: "roadmaster-23cbc",
  storageBucket: "roadmaster-23cbc.firebasestorage.app",
  messagingSenderId: "597704342474",
  appId: "1:597704342474:web:6ad71bf5dbbff79b452d33",
  measurementId: "G-GSCV96CCV9"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

//
// STUDENTS
//
export const addStudent = async (studentData) => {
  const docRef = await addDoc(collection(db, "students"), studentData);
  return docRef.id;
};

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, "students"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
  const docRef = doc(db, "students", id);
  await deleteDoc(docRef);
};

//
// LESSONS
//
export const addLesson = async (lessonData) => {
  const docRef = await addDoc(collection(db, "lessons"), {
    ...lessonData,
    timestamp: Date.now()
  });
  return docRef.id;
};

export const getLessons = async () => {
  const snapshot = await getDocs(collection(db, "lessons"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getLessonsForStudent = async (studentId) => {
  const q = query(
    collection(db, "lessons"),
    where("studentId", "==", studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteLesson = async (id) => {
  const docRef = doc(db, "lessons", id);
  await deleteDoc(docRef);
};

//
// MESSAGES
//
export const sendMessage = async (message) => {
  const docRef = await addDoc(collection(db, "messages"), {
    ...message,
    timestamp: Date.now()
  });
  return docRef.id;
};

export const getMessagesForStudent = async (studentId) => {
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

//
// NOTIFICATIONS
//
export const sendNotification = async (notification) => {
  const docRef = await addDoc(collection(db, "notifications"), {
    ...notification,
    read: false,
    timestamp: Date.now()
  });
  return docRef.id;
};

export const getNotifications = async () => {
  const snapshot = await getDocs(collection(db, "notifications"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationRead = async (id) => {
  const docRef = doc(db, "notifications", id);
  await updateDoc(docRef, { read: true });
};