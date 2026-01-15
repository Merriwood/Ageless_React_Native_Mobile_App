import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://fitness_tracker_db_ewht_user:m4sxNiEGxSkhPYpHJDI6uiL2rIu41GsD@dpg-d2g5j8fdiees73d3nne0-a.virginia-postgres.render.com/fitness_tracker_db_ewht',
  ssl: { rejectUnauthorized: false }
});

async function checkFitnessDb() {
  const client = await pool.connect();
  try {
    console.log('\n=== CHECKING FITNESS APPLICATION DATABASE ===\n');

    // Check tables
    console.log('📋 Tables:');
    const tables = await client.query(`
      SELECT tablename, pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    tables.rows.forEach(t => console.log(`  - ${t.tablename} (${t.size})`));

    if (tables.rows.length === 0) {
      console.log('  ⚠️  No tables found!');
      process.exit(0);
    }

    // Check users
    console.log('\n👥 USERS:');
    const users = await client.query(`
      SELECT id, email, goal, created_at
      FROM users
      ORDER BY created_at ASC
    `);
    console.log(`Total: ${users.rows.length}\n`);
    users.rows.slice(0, 10).forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} (ID: ${u.id}, Goal: ${u.goal || 'N/A'}, Created: ${u.created_at})`);
    });
    if (users.rows.length > 10) {
      console.log(`... and ${users.rows.length - 10} more users`);
    }

    // Check entries
    console.log('\n📝 WORKOUT ENTRIES:');
    const entries = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users,
        MIN(entry_date) as earliest,
        MAX(entry_date) as latest,
        COUNT(DISTINCT entry_date) as unique_dates
      FROM entries
    `);
    console.log(`  Total entries: ${entries.rows[0].total}`);
    console.log(`  Unique users with entries: ${entries.rows[0].unique_users}`);
    console.log(`  Date range: ${entries.rows[0].earliest} to ${entries.rows[0].latest}`);
    console.log(`  Unique workout dates: ${entries.rows[0].unique_dates}`);

    // Show entries by month
    console.log('\n📊 ENTRIES BY MONTH:');
    const byMonth = await client.query(`
      SELECT
        TO_CHAR(entry_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM entries
      GROUP BY TO_CHAR(entry_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    byMonth.rows.forEach(m => console.log(`  ${m.month}: ${m.count} entries`));

    // Sample recent entries
    console.log('\n💪 RECENT ENTRIES (Last 5):');
    const recent = await client.query(`
      SELECT e.entry_date, u.email, e.weight, e.created_at
      FROM entries e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.entry_date DESC
      LIMIT 5
    `);
    recent.rows.forEach(e => {
      console.log(`  ${e.entry_date}: ${e.email} (weight: ${e.weight || 'N/A'})`);
    });

    // Database size
    console.log('\n💾 DATABASE SIZE:');
    const dbSize = await client.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    console.log(`  Total: ${dbSize.rows[0].size}`);

    console.log('\n✅ SUCCESS! Found fitness application data!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

checkFitnessDb();
