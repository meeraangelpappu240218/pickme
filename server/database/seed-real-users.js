import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedRealUsers() {
  try {
    console.log('🌱 Creating real users in database...');
    
    // Create admin user - Asha
    const adminPasswordHash = await bcrypt.hash('12345Asha@!', 12);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .upsert([
        {
          email: 'ashakarthikeyan24@gmail.com',
          password_hash: adminPasswordHash,
          name: 'Asha',
          role: 'admin',
          is_active: true
        }
      ], { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (adminError && !adminError.message.includes('duplicate')) {
      console.error('❌ Error creating admin user:', adminError);
    } else {
      console.log('✅ Admin user Asha created/updated successfully');
    }
    
    // Create sample officer
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .upsert([
        {
          name: 'Inspector Ramesh Kumar',
          mobile: '+919791103607',
          telegram_id: '@rameshcop',
          email: 'ramesh.kumar@police.gov.in',
          department: 'Cyber Crime',
          rank: 'Inspector',
          badge_number: 'CC001',
          status: 'Active',
          credits_remaining: 45,
          total_credits: 50,
          total_queries: 23,
          pro_access_enabled: true,
          rate_limit_per_hour: 100
        }
      ], { 
        onConflict: 'mobile',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (officerError && !officerError.message.includes('duplicate')) {
      console.error('❌ Error creating officer:', officerError);
    } else {
      console.log('✅ Officer Ramesh Kumar created/updated successfully');
    }

    // Create some sample requests for the officer
    if (officer) {
      const sampleRequests = [
        {
          officer_id: officer.id,
          type: 'PRO',
          input: '9791103607',
          source: 'Signzy API',
          result_summary: 'Phone owner: Ramesh Kumar, Location: Chennai, Operator: Airtel',
          credits_used: 2,
          status: 'Success',
          response_time_ms: 1800,
          platform: 'api',
          completed_at: new Date().toISOString()
        },
        {
          officer_id: officer.id,
          type: 'OSINT',
          input: 'john.doe@email.com',
          source: 'Social Media Scraper',
          result_summary: 'Found profiles on LinkedIn, Facebook, Twitter',
          credits_used: 0,
          status: 'Success',
          response_time_ms: 2400,
          platform: 'api',
          completed_at: new Date().toISOString()
        }
      ];

      const { error: requestsError } = await supabase
        .from('requests')
        .upsert(sampleRequests, { ignoreDuplicates: true });

      if (requestsError) {
        console.error('❌ Error creating sample requests:', requestsError);
      } else {
        console.log('✅ Sample requests created');
      }
    }

    // Create sample credit transaction
    if (officer) {
      const { error: creditError } = await supabase
        .from('credit_transactions')
        .upsert([
          {
            officer_id: officer.id,
            action: 'Renewal',
            credits: 50,
            previous_balance: 0,
            new_balance: 50,
            payment_mode: 'Department Budget',
            remarks: 'Initial credit allocation',
            processed_by: adminUser?.id
          }
        ], { ignoreDuplicates: true });

      if (creditError) {
        console.error('❌ Error creating credit transaction:', creditError);
      } else {
        console.log('✅ Sample credit transaction created');
      }
    }

    console.log('🎉 Real users and sample data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin Portal:');
    console.log('  Email: ashakarthikeyan24@gmail.com');
    console.log('  Password: 12345Asha@!');
    console.log('\nOfficer Portal:');
    console.log('  Email: ramesh.kumar@police.gov.in');
    console.log('  Mobile: +919791103607');
    console.log('  Password: officer123');
    
  } catch (error) {
    console.error('❌ Error seeding real users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRealUsers();
}

export { seedRealUsers };