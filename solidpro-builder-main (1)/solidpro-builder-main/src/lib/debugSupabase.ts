import { supabase } from '@/integrations/supabase/client';

/**
 * Debug function to check what's actually in the database
 */
export const debugSupabaseConnection = async () => {
    console.log('=== DEBUG: Checking Supabase Connection ===');

    try {
        // Check the Supabase URL being used
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Project ID:', import.meta.env.VITE_SUPABASE_PROJECT_ID);

        // Try to count rows
        const { count, error: countError } = await supabase
            .from('resumes')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error counting rows:', countError);
            return;
        }

        console.log(`📊 Total rows in resumes table: ${count}`);

        // Try to fetch all rows
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching rows:', error);
            return;
        }

        console.log(`✅ Successfully fetched ${data?.length || 0} rows`);
        console.log('First 3 rows:', data?.slice(0, 3));

        // Check if we can insert a test row
        console.log('🧪 Testing insert capability...');
        const testData = {
            full_name: 'TEST_USER_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            summary: 'This is a test insert to verify database connectivity',
        };

        const { data: insertData, error: insertError } = await supabase
            .from('resumes')
            .insert(testData)
            .select();

        if (insertError) {
            console.error('❌ Insert test failed:', insertError);
        } else {
            console.log('✅ Insert test successful:', insertData);

            // Delete the test row
            if (insertData && insertData[0]) {
                await supabase
                    .from('resumes')
                    .delete()
                    .eq('id', insertData[0].id);
                console.log('🧹 Cleaned up test row');
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }

    console.log('=== DEBUG: Check Complete ===');
};

// Auto-run on import for debugging
if (typeof window !== 'undefined') {
    (window as any).debugSupabase = debugSupabaseConnection;
    console.log('💡 Debug function available: Run debugSupabase() in console');
}
