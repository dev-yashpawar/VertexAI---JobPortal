import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyPVPTvwAMAqfqnRYOxPIPI0SQa4RcvcA",
  authDomain: "job-portal-2338f.firebaseapp.com",
  projectId: "job-portal-2338f",
  storageBucket: "job-portal-2338f.firebasestorage.app",
  messagingSenderId: "579070409246",
  appId: "1:579070409246:web:6b3c43d4118aa20f0e0c0f",
  measurementId: "G-H9J04P70BL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

githubProvider.addScope('user:email');

export default app;
