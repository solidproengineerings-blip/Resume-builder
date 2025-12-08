import { supabase } from '@/integrations/supabase/client';

/**
 * Test Supabase connection and database schema
 */
export const testSupabaseConnection = async () => {
    console.log('=== Testing Supabase Connection ===');

    try {
        // Test 1: Check if client is initialized
        console.log('1. Checking Supabase client initialization...');
        if (!supabase) {
            console.error('❌ Supabase client is not initialized');
            return false;
        }
        console.log('✅ Supabase client initialized');

        // Test 2: Test basic connection
        console.log('2. Testing database connection...');
        const { data: healthCheck, error: healthError } = await supabase
            .from('resumes')
            .select('count')
            .limit(0);

        if (healthError) {
            console.error('❌ Database connection failed:', healthError);
            return false;
        }
        console.log('✅ Database connection successful');

        // Test 3: Check table structure
        console.log('3. Checking resumes table structure...');
        const { data: tableData, error: tableError } = await supabase
            .from('resumes')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Error accessing resumes table:', tableError);
            return false;
        }
        console.log('✅ Resumes table accessible');
        console.log('Sample data structure:', tableData?.[0] || 'No data yet');

        // Test 4: List all resumes
        console.log('4. Listing all resumes...');
        const { data: allResumes, error: listError } = await supabase
            .from('resumes')
            .select('id, created_at, personal_info')
            .order('created_at', { ascending: false });

        if (listError) {
            console.error('❌ Error listing resumes:', listError);
            return false;
        }
        console.log(`✅ Found ${allResumes?.length || 0} resumes in database`);
        if (allResumes && allResumes.length > 0) {
            console.log('Latest resume:', allResumes[0]);
        }

        console.log('=== All Tests Passed ===');
        return true;
    } catch (error) {
        console.error('❌ Unexpected error during testing:', error);
        return false;
    }
};
