import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    if (!auth) {
      // Firebase auth is missing (probably missing .env config)
      setLoading(false);
      return;
    }

    // Safety timeout: if Firebase doesn't respond in 6 seconds, unblock the app
    const safetyTimeout = setTimeout(() => {
      console.warn('Firebase auth timeout — proceeding without auth.');
      setLoading(false);
    }, 6000);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimeout);
      setUser(currentUser);

      if (currentUser?.email) {
        // 1. Sync search credits in Supabase
        try {
          const { data, error } = await supabase
            .from('user_search_credits')
            .select('id')
            .eq('email', currentUser.email.toLowerCase())
            .single();
          
          if (error && error.code === 'PGRST116') {
            // User doesn't exist yet, initialize them in Supabase
            await supabase
              .from('user_search_credits')
              .insert([{ email: currentUser.email.toLowerCase(), searches_remaining: 3, plan_level: 'free' }]);
          }
        } catch (err) {
          console.error('Error auto-syncing user to Supabase:', err);
        }

        // 2. Query Firestore database to check if this user has already registered a service
        try {
          if (db) {
            const q = query(
              collection(db, 'serviceForms'),
              where('email', '==', currentUser.email)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setHasRegistered(true);
              localStorage.setItem(`hasRegisteredService_${currentUser.email.toLowerCase()}`, 'true');
            } else {
              // Fallback to local storage in case Firestore query is empty but it was set locally
              const localReg = localStorage.getItem(`hasRegisteredService_${currentUser.email.toLowerCase()}`) === 'true';
              setHasRegistered(localReg);
            }
          } else {
            const localReg = localStorage.getItem(`hasRegisteredService_${currentUser.email.toLowerCase()}`) === 'true';
            setHasRegistered(localReg);
          }
        } catch (err) {
          console.error('Error checking service registration from Firestore:', err);
          const localReg = localStorage.getItem(`hasRegisteredService_${currentUser.email.toLowerCase()}`) === 'true';
          setHasRegistered(localReg);
        }
      } else {
        setHasRegistered(false);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(220,38,38,0.2)',
          borderTop: '4px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#f87171', fontSize: '14px', margin: 0, letterSpacing: '0.05em' }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, hasRegistered, setHasRegistered }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
