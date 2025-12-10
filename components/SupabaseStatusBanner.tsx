import React, { useEffect, useState } from 'react';
import { runConnectionTests } from '../services/testConnection';

interface ConnectionStatus {
    database: { success: boolean; message: string };
    storage: { success: boolean; message: string };
    allPassed: boolean;
}

export const SupabaseStatusBanner: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      const result = await runConnectionTests();
      setStatus(result);
      // You can still handle result internally if needed
      console.log("Supabase status:", result);
    };

    testConnection();
  }, []);

  return null; // 👈 nothing is rendered
};

