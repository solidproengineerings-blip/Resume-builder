import { supabase } from './supabaseClient';

/**
 * Test the Supabase database connection
 * Returns true if connection is successful, false otherwise
 */
export const testDatabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
        return {
            success: false,
            message: 'Supabase client not initialized. Check your environment variables.'
        };
    }

    try {
        // Try to query the resumes table
        const { data, error } = await supabase
            .from('resumes')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Database connection error:', error);
            return {
                success: false,
                message: `Database error: ${error.message}`
            };
        }

        return {
            success: true,
            message: 'Successfully connected to Supabase database!'
        };
    } catch (err) {
        console.error('Connection test failed:', err);
        return {
            success: false,
            message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        };
    }
};

/**
 * Test the Supabase storage connection
 * Returns true if storage bucket is accessible, false otherwise
 */
export const testStorageConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase) {
        return {
            success: false,
            message: 'Supabase client not initialized.'
        };
    }

    try {
        // Try to list files in the resume-pdfs bucket
        const { data, error } = await supabase
            .storage
            .from('resume-pdfs')
            .list('', { limit: 1 });

        if (error) {
            console.error('Storage connection error:', error);
            return {
                success: false,
                message: `Storage error: ${error.message}`
            };
        }

        return {
            success: true,
            message: 'Successfully connected to Supabase storage!'
        };
    } catch (err) {
        console.error('Storage test failed:', err);
        return {
            success: false,
            message: `Storage test failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        };
    }
};

/**
 * Run all connection tests
 */
export const runConnectionTests = async () => {
    console.log('🔍 Testing Supabase connections...');

    const dbResult = await testDatabaseConnection();
    console.log(dbResult.success ? '✅' : '❌', 'Database:', dbResult.message);

    const storageResult = await testStorageConnection();
    console.log(storageResult.success ? '✅' : '❌', 'Storage:', storageResult.message);

    return {
        database: dbResult,
        storage: storageResult,
        allPassed: dbResult.success && storageResult.success
    };
};
