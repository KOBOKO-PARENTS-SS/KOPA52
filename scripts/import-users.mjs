import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables or paste values directly for one-time run
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gujywkpwuedjidqazhgn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anl3a3B3dWVkamlkcWF6aGduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3MDM3NSwiZXhwIjoyMTAwMDQ2Mzc1fQ.Ms3gk4TfVgIsxK62u11g7PJye8GNhnHNKrnf50yaruA';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_SERVICE')) {
  console.error('❌ Error: Please provide your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function importUsers() {
  const filePath = path.resolve('users.csv');

  if (!fs.existsSync(filePath)) {
    console.error('❌ Could not find users.csv in the root directory.');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  console.log(`🚀 Starting bulk import for ${lines.length - 1} users...\n`);

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    if (!row.email || !row.password) {
      console.log(`⚠️ Skipping line ${i + 1}: Missing email or password.`);
      continue;
    }

    try {
      // 1. Create Auth User in auth.users
      const { data, error } = await supabase.auth.admin.createUser({
        email: row.email,
        password: row.password,
        email_confirm: true, // Auto-confirms email so users can log in immediately
        user_metadata: {
          full_name: row.full_name || '',
          role: (row.role || 'teacher').toLowerCase(),
        },
      });

      if (error) {
        console.error(`❌ Failed (${row.email}): ${error.message}`);
        continue;
      }

      const userId = data.user.id;
      const userRole = (row.role || 'teacher').toLowerCase();

      // 2. Insert/Update into public.profiles table (Optional backup mapping)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: row.email,
        full_name: row.full_name || '',
        role: userRole,
      });

      if (profileError) {
        console.warn(`⚠️ Created Auth user for ${row.email}, but profiles insert failed: ${profileError.message}`);
      } else {
        console.log(`✅ Successfully created [${userRole.toUpperCase()}]: ${row.email}`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error processing ${row.email}:`, err);
    }
  }

  console.log('\n🎉 Bulk import complete!');
}

importUsers();