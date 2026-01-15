import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('\n=== Checking Render Database ===\n');

    // Check tables
    console.log('📋 Tables in database:');
    const tables = await query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    tables.rows.forEach(row => console.log(`  - ${row.tablename}`));

    // Check users table structure
    console.log('\n👤 Users table structure:');
    const userColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Count users
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Total users: ${userCount.rows[0].count}`);

    // Show sample users (without passwords)
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('\n👥 Sample users:');
      const users = await query(`
        SELECT id, email, goal, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `);
      users.rows.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Goal: ${user.goal || 'N/A'}, Created: ${user.created_at}`);
      });
    }

    // Check entries table structure
    console.log('\n🏋️ Entries table structure:');
    const entryColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'entries'
      ORDER BY ordinal_position
    `);
    entryColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Count entries
    const entryCount = await query('SELECT COUNT(*) as count FROM entries');
    console.log(`\n📊 Total entries: ${entryCount.rows[0].count}`);

    // Show sample entries
    if (parseInt(entryCount.rows[0].count) > 0) {
      console.log('\n📝 Sample entries:');
      const entries = await query(`
        SELECT e.user_id, u.email, e.entry_date, e.weight, e.created_at
        FROM entries e
        LEFT JOIN users u ON e.user_id = u.id
        ORDER BY e.created_at DESC
        LIMIT 5
      `);
      entries.rows.forEach(entry => {
        console.log(`  - User: ${entry.email || entry.user_id}, Date: ${entry.entry_date}, Weight: ${entry.weight || 'N/A'}, Created: ${entry.created_at}`);
      });

      // Show fitness data sample
      console.log('\n💪 Sample fitness data:');
      const fitnessData = await query(`
        SELECT e.entry_date, u.email, e.fitness_data
        FROM entries e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.fitness_data IS NOT NULL
        ORDER BY e.created_at DESC
        LIMIT 3
      `);
      fitnessData.rows.forEach(entry => {
        console.log(`  - ${entry.email}: ${entry.entry_date}`);
        console.log(`    Data: ${JSON.stringify(entry.fitness_data).substring(0, 100)}...`);
      });
    }

    console.log('\n✅ Database check complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error checking database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDatabase();
