import { createContext, useContext, useEffect, useState } from 'react';
import { sql } from '../lib/db';
import { hashPassword, verifyPassword, generateToken, getStoredToken, setStoredToken, removeStoredToken, verifyToken, TokenPayload } from '../lib/auth';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: TokenPayload | null;
  profile: Omit<Profile, 'password_hash'> | null;
  loading: boolean;
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

  useEffect(() => {
    // Check for stored token on mount
    const initAuth = async () => {
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
    };
    
    initAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const result = await sql`
        SELECT id, email, full_name, phone, resume_url, skills, experience_years, is_admin, created_at, updated_at
        FROM profiles
        WHERE id = ${userId}
      `;
      
      if (result.length > 0) {
        setProfile(result[0] as Omit<Profile, 'password_hash'>);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await sql`
        SELECT id, email, password_hash, is_admin
        FROM profiles
        WHERE email = ${email}
      `;

      if (result.length === 0) {
        throw new Error('Invalid email or password');
      }

      const profile = result[0] as Profile;
      const isValid = await verifyPassword(password, profile.password_hash);

      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      const payload: TokenPayload = {
        userId: profile.id,
        email: profile.email,
        isAdmin: profile.is_admin,
      };

      const token = await generateToken(payload);
      setStoredToken(token);
      setUser(payload);
      await fetchProfile(profile.id);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Check if user already exists
      const existing = await sql`
        SELECT id FROM profiles WHERE email = ${email}
      `;

      if (existing.length > 0) {
        throw new Error('Email already registered');
      }

      const passwordHash = await hashPassword(password);
      const userId = crypto.randomUUID();

      await sql`
        INSERT INTO profiles (id, email, password_hash, full_name, is_admin)
        VALUES (${userId}, ${email}, ${passwordHash}, ${fullName}, false)
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
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
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
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
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
