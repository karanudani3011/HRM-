import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase auth is missing (probably missing .env config)
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser?.email) {
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
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
