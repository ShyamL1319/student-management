import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * SchoolBranding – static branding configuration for the single-school
 * EduSphere deployment.  All tenant / subdomain resolution logic has been
 * removed because the platform now serves a single school only.
 */
export interface SchoolBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  schoolName: string;
}

export interface SchoolContextProps {
  schoolName: string;
  domain: string;
  branding: SchoolBranding;
  loading: boolean;
  error: string | null;
}

const EDUSPHERE_BRANDING: SchoolBranding = {
  primaryColor: '#4f46e5',
  secondaryColor: '#0ea5e9',
  logoUrl: '/assets/default-logo.png',
  schoolName: 'EduSphere',
};

const SchoolContext = createContext<SchoolContextProps | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Single-school deployment – no subdomain or DNS resolution needed.
    document.title = 'EduSphere - School Portal';
    setLoading(false);
  }, []);

  const value: SchoolContextProps = {
    schoolName: EDUSPHERE_BRANDING.schoolName,
    domain: typeof window !== 'undefined' ? window.location.hostname : '',
    branding: EDUSPHERE_BRANDING,
    loading,
    error,
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};

/**
 * Hook to access the school context.
 * Drop-in replacement for the old `useTenant` hook.
 */
export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider wrapper.');
  }
  return context;
};

// ── Backward-compatible re-exports so existing imports keep working ────────
// These aliases can be removed once every consumer has been migrated.
/** @deprecated Use SchoolBranding instead */
export type TenantBranding = SchoolBranding;
/** @deprecated Use SchoolContextProps instead */
export type TenantContextProps = SchoolContextProps;
/** @deprecated Use SchoolProvider instead */
export const TenantProvider = SchoolProvider;
/** @deprecated Use useSchool instead */
export const useTenant = useSchool;
