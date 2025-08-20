
// This script runs in the offscreen document to handle Firebase Auth.

// IMPORTANT: Replace these with your actual Firebase config values
// You can find these in your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "YOUR_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_NEXT_PUBLIC_FIREBASE_APP_ID",
};

// A warning to the developer to replace the placeholder values.
if (firebaseConfig.apiKey.startsWith("YOUR_")) {
  console.error("Please replace the placeholder Firebase config in public/offscreen.js");
}

// Import Firebase scripts
try {
  importScripts(
    `https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js`
  );

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== 'offscreen') {
      return;
    }

    switch (message.action) {
      case 'signInWithGoogle':
        signInWithGoogle()
          .then(user => sendResponse(user))
          .catch(error => sendResponse({ error: error.message }));
        return true; // Indicates async response

      case 'signOut':
        auth.signOut()
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ error: error.message }));
        return true; // Indicates async response

      case 'getAuthState':
        const user = auth.currentUser;
        sendResponse(user ? {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        } : null);
        break;
    }
  });

} catch (e) {
  console.error("Error importing or initializing Firebase in offscreen document:", e);
}


async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    // Return a serializable user object
    return {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid,
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}
