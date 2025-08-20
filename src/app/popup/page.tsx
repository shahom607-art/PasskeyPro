
"use client";

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import AuthView from '@/components/popup/auth-view';
import AppView from '@/components/popup/app-view';

// A custom, serializable User type for message passing
type SerializableUser = Pick<User, 'displayName' | 'email' | 'photoURL' | 'uid'>;

export default function PopupPage() {
  const [user, setUser] = useState<SerializableUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on component mount
  useEffect(() => {
    chrome.runtime.sendMessage({
      type: 'firebase-auth',
      action: 'getAuthState'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }
      setUser(response);
      setLoading(false);
    });
  }, []);

  const handleSignIn = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      type: 'firebase-auth',
      action: 'signInWithGoogle'
    }, (response) => {
       if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }
      if (response && !response.error) {
        setUser(response);
      } else {
        console.error("Sign in failed:", response?.error);
      }
      setLoading(false);
    });
  };

  const handleSignOut = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      type: 'firebase-auth',
      action: 'signOut'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }
      if (response?.success) {
        setUser(null);
      } else {
        console.error("Sign out failed:", response?.error);
      }
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {user ? (
        <AppView user={user} onSignOut={handleSignOut} />
      ) : (
        <AuthView onSignIn={handleSignIn} />
      )}
    </div>
  );
}
