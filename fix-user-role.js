#!/usr/bin/env node
/* eslint-disable no-console */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Refusing to run privileged admin provisioning.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.warn('This helper intentionally does not perform direct role changes.');
  console.warn('Use the approved internal admin provisioning workflow instead.');

  const { data, error } = await supabase.from('User').select('id, email, role').limit(5);
  if (error) {
    console.error('Unable to query the user table:', error);
    process.exit(1);
  }

  console.log('Example user records:');
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
