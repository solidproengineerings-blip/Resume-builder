import React, { useEffect, useState } from 'react';
import { runConnectionTests } from '../services/testConnection';

interface ConnectionStatus {
    database: { success: boolean; message: string };
    storage: { success: boolean; message: string };
    allPassed: boolean;
}

export const SupabaseStatusBanner: React.FC = () => {
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const testConnection = async () => {
            setIsLoading(true);
            const result = await runConnectionTests();
            setStatus(result);
            setIsLoading(false);

            // Auto-hide success banner after 5 seconds
            if (result.allPassed) {
                setTimeout(() => setIsVisible(false), 5000);
            }
        };

        testConnection();
    }, []);

    if (!isVisible || isLoading) {
        return null;
    }

    if (!status) {
        return null;
    }

    const getBannerStyle = () => {
        if (status.allPassed) {
            return {
                backgroundColor: '#10b981',
                color: 'white',
            };
        }
        return {
            backgroundColor: '#f59e0b',
            color: 'white',
        };
    };

    return (
        <div
            style={{
                ...getBannerStyle(),
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>
                    {status.allPassed ? '✅' : '⚠️'}
                </span>
                <div>
                    {status.allPassed ? (
                        <div>
                            <strong>Supabase Connected!</strong> Cloud features are enabled.
                        </div>
                    ) : (
                        <div>
                            <div><strong>Supabase Connection Issues</strong></div>
                            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                                {!status.database.success && (
                                    <div>❌ Database: {status.database.message}</div>
                                )}
                                {!status.storage.success && (
                                    <div>❌ Storage: {status.storage.message}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '0 8px',
                    opacity: 0.8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
            >
                ×
            </button>
        </div>
    );
};
