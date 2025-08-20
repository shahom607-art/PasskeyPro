import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let currentUser: User | null = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

const getCredentials = async (): Promise<any[]> => {
    const data = await chrome.storage.local.get('user-credentials');
    return data['user-credentials'] || [];
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'firebase-auth') {
        switch (message.action) {
            case 'getAuthState':
                if (currentUser) {
                    const { uid, email, displayName, photoURL } = currentUser;
                    sendResponse({ uid, email, displayName, photoURL });
                } else {
                    sendResponse(null);
                }
                break;
            case 'signInWithGoogle':
                signInWithPopup(auth, new GoogleAuthProvider())
                    .then(result => {
                        const user = result.user;
                        const { uid, email, displayName, photoURL } = user;
                        sendResponse({ uid, email, displayName, photoURL });
                    })
                    .catch(error => sendResponse({ error: error.message }));
                return true; // async
            case 'signOut':
                firebaseSignOut(auth)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch(error => sendResponse({ error: error.message }));
                return true; // async
        }
    } else if (message.type === 'autofill-credentials') {
        if(message.action === 'get' && sender.tab?.url) {
            getCredentials().then(credentials => {
                try {
                    const url = new URL(sender.tab.url);
                    const matchingCreds = credentials.filter(c => {
                        if (!c.website) return false;
                        // Support both full URLs and domain names
                        return url.origin.includes(c.website) || c.website.includes(url.hostname);
                    });
                    sendResponse(matchingCreds);
                } catch(e) {
                    sendResponse([]);
                }
            });
            return true; // async
        }
    } else if (message.type === 'fill-credentials') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'fill-credentials-form',
                    credentials: message.credentials
                });
            }
        });
    }
    return false;
});
