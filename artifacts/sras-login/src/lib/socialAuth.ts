// Social authentication via Firebase (Google + Facebook).
// Firebase is loaded lazily so that pages without social login don't pay the
// bundle cost, and so the app still runs when no Firebase config is provided.
//
// To enable real OAuth, set these env vars (Vite will inline them):
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_APP_ID
// Then in your Firebase console enable Google + Facebook providers and add
// your dev/prod domains to "Authorized domains".

export type Role = "reporter" | "volunteer" | "ngo" | "donor" | "admin";

export interface SocialUser {
  name: string;
  email: string;
  photoURL?: string;
  provider: "google" | "facebook";
  role: Role;
  uid?: string;
}

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

// Lazy singleton initializer to avoid loading firebase until needed.
let authPromise: Promise<unknown> | null = null;
async function getAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Social sign-in isn't configured yet. Add Firebase keys (VITE_FIREBASE_*) to enable Google/Facebook login."
    );
  }
  if (!authPromise) {
    authPromise = (async () => {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth, setPersistence, browserLocalPersistence } = await import("firebase/auth");
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      const auth = getAuth(app);
      // Persistent session: stay signed in across reloads.
      try { await setPersistence(auth, browserLocalPersistence); } catch {}
      return auth;
    })();
  }
  return authPromise;
}

async function popupSignIn(provider: "google" | "facebook", role: Role): Promise<SocialUser> {
  const auth = await getAuth();
  const { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } = await import("firebase/auth");
  const p = provider === "google" ? new GoogleAuthProvider() : new FacebookAuthProvider();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await signInWithPopup(auth as any, p);
  const u = result.user;
  return {
    name: u.displayName || u.email?.split("@")[0] || "User",
    email: u.email || "",
    photoURL: u.photoURL || undefined,
    provider,
    role,
    uid: u.uid,
  };
}

export async function signInWithGoogle(role: Role): Promise<SocialUser> {
  return popupSignIn("google", role);
}

export async function signInWithFacebook(role: Role): Promise<SocialUser> {
  return popupSignIn("facebook", role);
}

// Persist signed-in user (works for both social and email/password flows).
export function persistSession(user: SocialUser) {
  localStorage.setItem("sahara_user", JSON.stringify(user));
  localStorage.setItem("token", `social-${Date.now()}`);
}

export function routeForRole(role: Role): string {
  switch (role) {
    case "reporter": return "/reporter-dashboard";
    case "volunteer": return "/dashboard";
    case "ngo": return "/ngo-dashboard";
    case "donor": return "/donor-dashboard";
    case "admin": return "/admin-dashboard";
  }
}
