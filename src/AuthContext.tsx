import React, { createContext, useContext, useEffect, useState } from 'react';
import sql from './db';
import { hashPassword, verifyPassword, generateToken, getStoredToken, setStoredToken, removeStoredToken, verifyToken, TokenPayload, generateUUID } from './auth';
import type { Profile } from './database';

interface AuthContextType {
  user: TokenPayload | null;
  profile: Omit<Profile, 'password_hash'> | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [profile, setProfile] = useState<Omit<Profile, 'password_hash'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          const payload = await verifyToken(token);
          if (payload) {
            setUser(payload);
            await fetchProfile(payload.userId);
          } else {
            removeStoredToken();
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Auth initialization failed:', err);
        setError(err.message || 'Authentication failed to initialize');
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const result = await sql`
        SELECT id, email, full_name, phone, resume_url, skills, experience_years, is_admin, role, created_at, updated_at
        FROM profiles
        WHERE id = ${userId}
      `;
      
      if (result.length > 0) {
        setProfile(result[0] as Omit<Profile, 'password_hash'>);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await sql`
        SELECT id, email, password_hash, is_admin, role
        FROM profiles
        WHERE email = ${email}
      `;

      if (result.length === 0) {
        throw new Error('Invalid email or password');
      }

      const profileData = result[0] as Profile;
      const isValid = await verifyPassword(password, profileData.password_hash);

      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      const payload: TokenPayload = {
        userId: profileData.id,
        email: profileData.email,
        isAdmin: profileData.is_admin,
      };

      const token = await generateToken(payload);
      setStoredToken(token);
      setUser(payload);
      await fetchProfile(profileData.id);
    } catch (err: any) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const existing = await sql`
        SELECT id FROM profiles WHERE email = ${email}
      `;

      if (existing.length > 0) {
        throw new Error('Email already registered');
      }

      const passwordHash = await hashPassword(password);
      const userId = generateUUID();

      await sql`
        INSERT INTO profiles (id, email, password_hash, full_name, is_admin, role)
        VALUES (${userId}, ${email}, ${passwordHash}, ${fullName}, false, 'job_seeker')
      `;

      const payload: TokenPayload = {
        userId,
        email,
        isAdmin: false,
      };

      const token = await generateToken(payload);
      setStoredToken(token);
      setUser(payload);
      await fetchProfile(userId);
    } catch (err: any) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const signOut = () => {
    removeStoredToken();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'password_hash') {
          updateFields.push(`${key} = $${values.length + 1}`);
          values.push(value);
        }
      });

      if (updateFields.length === 0) return;

      values.push(user.userId);
      const query = `
        UPDATE profiles
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length}
      `;

      await sql(query, values);
      await fetchProfile(user.userId);
    } catch (err: any) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-red-500/50 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Initialization Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
