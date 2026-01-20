import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBHAGf5NleYjckCad9mjr09_doR_5lce4Y",
  authDomain: "roadmaster-23cbc.firebaseapp.com",
  projectId: "roadmaster-23cbc",
  storageBucket: "roadmaster-23cbc.appspot.com",
  messagingSenderId: "597704342474",
  appId: "1:597704342474:web:6ad71bf5dbbff79b452d33"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }