import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBu5x9cDzz-N8vqY7XBar3ZSXB_BdNh60",
  authDomain: "indian-infra.firebaseapp.com",
  projectId: "indian-infra",
  storageBucket: "indian-infra.appspot.com",
  messagingSenderId: "309995967846",
  appId: "1:309995967846:web:d99a2a57dae21993a424a7",
  measurementId: "G-CL046RHT3T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app; // ✅ Add this line to fix the error
