import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB7mn39sLEDSdyJmq2u7gda6SbDcnU21VE",
  authDomain: "resource-connect-e39be.firebaseapp.com",
  projectId: "resource-connect-e39be",
  storageBucket: "resource-connect-e39be.firebasestorage.app",
  messagingSenderId: "8803315322",
  appId: "1:8803315322:web:f740e23f0e62a998f315c3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;