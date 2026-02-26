import React, { createContext, useContext, useState } from 'react';

interface AdminSessionContextValue {
  adminVerified: boolean;
  setAdminVerified: (verified: boolean) => void;
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  adminVerified: false,
  setAdminVerified: () => {},
});

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [adminVerified, setAdminVerified] = useState(false);
  return (
    <AdminSessionContext.Provider value={{ adminVerified, setAdminVerified }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
