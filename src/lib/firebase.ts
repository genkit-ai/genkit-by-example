/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  logEvent as analyticsLogEvent,
  Analytics,
  setUserId,
} from "firebase/analytics";
import {
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig = {
  apiKey: "AIzaSyBHg4Y_CEMBU7aaxrO19Y1NsvUXiVeiGfo",
  authDomain: "genkit-by-example.firebaseapp.com",
  projectId: "genkit-by-example",
  storageBucket: "genkit-by-example.firebasestorage.app",
  messagingSenderId: "515443902134",
  appId: "1:515443902134:web:ce23c3419ffbc81b240817",
  measurementId: "G-PVQ062HLN2",
};

const encodedFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG_BASE64;
if (encodedFirebaseConfig) {
  const decodedConfigString = Buffer.from(encodedFirebaseConfig, 'base64').toString('utf8');
  firebaseConfig = JSON.parse(decodedConfigString);
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let analytics: Analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export function logEvent(name: string, props: Record<string, any>) {
  if (!analytics) analytics = getAnalytics(app);
  analyticsLogEvent(analytics, name, props);
}
export function setCurrentScreen(name: string) {
  if (!analytics) analytics = getAnalytics(app);
}

export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence],
});
export const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
  if (typeof window !== "undefined") {
    if (!user) {
      const { user: createdUser } = await signInAnonymously(auth);
      console.log("Created guest user account with id", createdUser.uid);
      return;
    }

    setUserId(getAnalytics(app), user.uid);
  }
});
