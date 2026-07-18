// Script to fix admin access for ffyoussef12@gmail.com
// Uses Supabase client to update user role in database

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserRole() {
  console.log('=== Fixing Admin Access for ffyoussef12@gmail.com ===\n');

  try {
    // Step 1: Check current user status
    console.log('1. Checking current user status...');
    const { data: users, error: fetchError } = await supabase
      .from('User')
      .select('id, email, role, status, email_verified')
      .eq('email', 'ffyoussef12@gmail.com');

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error('User not found!');
      process.exit(1);
    }

    const user = users[0];
    console.log('Current user data:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Status:', user.status);
    console.log('  Email Verified:', user.email_verified);
    console.log('');

    // Check if TEACHER role is already allowed
    if (user.role === 'TEACHER') {
      console.log('✓ User already has TEACHER role, which is allowed in admin panel');
      console.log('  However, email_verified is:', user.email_verified);
      if (!user.email_verified) {
        console.log('  → Need to verify email to proceed');
      }
    }
    console.log('');

    // Step 2: Update user role to ADMIN and verify email
    console.log('2. Updating user to ADMIN role and verifying email...');
    const { data: updatedUsers, error: updateError } = await supabase
      .from('User')
      .update({
        role: 'ADMIN',
        status: 'ACTIVE',
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'ffyoussef12@gmail.com')
      .select('id, email, role, status, email_verified');

    if (updateError) {
      console.error('Error updating user:', updateError);
      process.exit(1);
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      console.error('No users were updated!');
      process.exit(1);
    }

    console.log(`Successfully updated ${updatedUsers.length} user(s)!`);
    updatedUsers.forEach((updatedUser, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  ID:', updatedUser.id);
      console.log('  Email:', updatedUser.email);
      console.log('  Role:', updatedUser.role);
      console.log('  Status:', updatedUser.status);
      console.log('  Email Verified:', updatedUser.email_verified);
    });
    console.log('');

    // Step 3: Success message
    console.log('=== Fix Applied Successfully ===\n');
    console.log('Next steps:');
    console.log('1. Clear your browser cookies/cache');
    console.log('2. Logout from the admin panel');
    console.log('3. Login again with:');
    console.log('   Email: ffyoussef12@gmail.com');
    console.log('');
    console.log('You should now have admin access!');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the fix
fixUserRole();
