import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllData() {
  try {
    console.log('\n=== Complete Database Audit ===\n');

    // Check ALL users
    console.log('👥 ALL USERS:');
    const allUsers = await query(`
      SELECT id, email, goal, created_at
      FROM users
      ORDER BY created_at ASC
    `);
    console.log(`Total users found: ${allUsers.rows.length}\n`);
    allUsers.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Goal: ${user.goal || 'N/A'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Check ALL entries with full date range
    console.log('\n📝 ALL WORKOUT ENTRIES:');
    const allEntries = await query(`
      SELECT e.id, e.user_id, u.email, e.entry_date, e.weight,
             e.created_at, e.updated_at,
             jsonb_pretty(e.fitness_data) as fitness_data
      FROM entries e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.entry_date ASC
    `);
    console.log(`Total entries found: ${allEntries.rows.length}\n`);

    if (allEntries.rows.length > 0) {
      console.log('Earliest entry:', allEntries.rows[0].entry_date);
      console.log('Latest entry:', allEntries.rows[allEntries.rows.length - 1].entry_date);
      console.log('\nAll entries:\n');

      allEntries.rows.forEach((entry, idx) => {
        console.log(`${idx + 1}. Entry Date: ${entry.entry_date}`);
        console.log(`   User: ${entry.email} (ID: ${entry.user_id})`);
        console.log(`   Weight: ${entry.weight || 'N/A'}`);
        console.log(`   Created: ${entry.created_at}`);
        console.log(`   Updated: ${entry.updated_at}`);
        console.log(`   Fitness Data: ${entry.fitness_data}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No entries found!\n');
    }

    // Check for any other tables
    console.log('\n📋 ALL TABLES IN DATABASE:');
    const allTables = await query(`
      SELECT schemaname, tablename,
             pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    allTables.rows.forEach(table => {
      console.log(`  - ${table.schemaname}.${table.tablename} (${table.size})`);
    });

    // Check database size
    console.log('\n💾 DATABASE SIZE:');
    const dbSize = await query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    console.log(`  Total: ${dbSize.rows[0].size}`);

    // Check for any data in different date ranges
    console.log('\n📊 ENTRIES BY MONTH:');
    const byMonth = await query(`
      SELECT
        TO_CHAR(entry_date, 'YYYY-MM') as month,
        COUNT(*) as count,
        MIN(entry_date) as first_date,
        MAX(entry_date) as last_date
      FROM entries
      GROUP BY TO_CHAR(entry_date, 'YYYY-MM')
      ORDER BY month DESC
    `);
    if (byMonth.rows.length > 0) {
      byMonth.rows.forEach(row => {
        console.log(`  ${row.month}: ${row.count} entries (${row.first_date} to ${row.last_date})`);
      });
    } else {
      console.log('  No entries to group');
    }

    console.log('\n✅ Complete audit finished!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAllData();
