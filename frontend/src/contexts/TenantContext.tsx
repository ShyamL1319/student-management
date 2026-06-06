import React, { createContext, useContext, useEffect, useState } from 'react';

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  schoolName: string;
}

export interface TenantContextProps {
  tenantId: string;
  domain: string;
  branding: TenantBranding;
  isCustomDomain: boolean;
  loading: boolean;
  error: string | null;
}

const defaultBranding: TenantBranding = {
  primaryColor: '#4f46e5', // standard Indigo
  secondaryColor: '#0ea5e9', // standard Sky
  logoUrl: '/assets/default-logo.png',
  schoolName: 'EdTech Multi-Tenant Portal',
};

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string>('default');
  const [domain, setDomain] = useState<string>('');
  const [branding, setBranding] = useState<TenantBranding>(defaultBranding);
  const [isCustomDomain, setIsCustomDomain] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveTenant = () => {
      try {
        const hostname = window.location.hostname;
        setDomain(hostname);

        // ── Domain Resolution Rules ──
        // Case A: Localhost development fallback
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          setTenantId('localhost-dev');
          setBranding({
            primaryColor: '#4f46e5',
            secondaryColor: '#10b981',
            logoUrl: '/assets/local-logo.png',
            schoolName: 'Local Development Academy',
          });
          setIsCustomDomain(false);
          document.title = 'Local Development Academy - School Portal';
        }
        // Case B: standard platform subdomain (e.g. hogwarts.edtechplatform.com)
        else if (hostname.endsWith('.edtechplatform.com') || hostname.endsWith('.myschoolportal.org')) {
          const subdomain = hostname.split('.')[0];
          setTenantId(subdomain);
          setIsCustomDomain(false);

          // Simulate resolving metadata based on subdomain
          const resolvedName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' Institution';
          setBranding({
            primaryColor: '#0d9488', // Teal for subdomains
            secondaryColor: '#3b82f6',
            logoUrl: `/assets/${subdomain}-logo.png`,
            schoolName: resolvedName,
          });
          document.title = `${resolvedName} - School Portal`;
        }
        // Case C: custom domain routing (e.g. portal.myschool.edu)
        else {
          setTenantId(hostname);
          setIsCustomDomain(true);

          // Parse name from custom domain
          const parts = hostname.split('.');
          const customName = parts[parts.length - 2]?.toUpperCase() + ' Academy' || 'Custom Domain Portal';
          setBranding({
            primaryColor: '#0f172a', // Slate for custom enterprise domains
            secondaryColor: '#6366f1',
            logoUrl: '/assets/custom-logo.png',
            schoolName: customName,
          });
          document.title = `${customName} - Official Portal`;
        }
      } catch (err) {
        setError('Error mapping tenant subdomain headers.');
      } finally {
        setLoading(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenantId, domain, branding, isCustomDomain, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider wrapper.');
  }
  return context;
};
