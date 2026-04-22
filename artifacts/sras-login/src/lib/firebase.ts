import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as analyticsSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "resource-connect-e39be.firebaseapp.com",
  projectId: "resource-connect-e39be",
  storageBucket: "resource-connect-e39be.firebasestorage.app",
  messagingSenderId: "8803315322",
  appId: "1:8803315322:web:f740e23f0e62a998f315c3",
  measurementId: "G-7K3PMC27BQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analyticsSupported()
    .then((ok) => {
      if (ok) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

export default app;
