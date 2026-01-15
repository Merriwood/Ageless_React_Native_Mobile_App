import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function deepSearch() {
  try {
    console.log('\n=== DEEP DATABASE SEARCH ===\n');

    // Check ALL schemas
    console.log('📂 ALL SCHEMAS:');
    const schemas = await query(`
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name
    `);
    schemas.rows.forEach(s => console.log(`  - ${s.schema_name}`));

    // Check ALL tables in ALL schemas
    console.log('\n📋 ALL TABLES (ALL SCHEMAS):');
    const allTables = await query(`
      SELECT table_schema, table_name,
             (SELECT COUNT(*) FROM information_schema.columns
              WHERE columns.table_schema = tables.table_schema
              AND columns.table_name = tables.table_name) as column_count
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `);
    console.log(`Found ${allTables.rows.length} tables:\n`);
    allTables.rows.forEach(t => {
      console.log(`  ${t.table_schema}.${t.table_name} (${t.column_count} columns)`);
    });

    // Check for any tables with fitness/workout/exercise related names
    console.log('\n🏋️ SEARCHING FOR FITNESS-RELATED TABLES:');
    const fitnessSearch = await query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND (
        table_name ILIKE '%fit%' OR
        table_name ILIKE '%work%' OR
        table_name ILIKE '%exerc%' OR
        table_name ILIKE '%entry%' OR
        table_name ILIKE '%user%' OR
        table_name ILIKE '%data%' OR
        table_name ILIKE '%activity%' OR
        table_name ILIKE '%record%'
      )
      ORDER BY table_schema, table_name
    `);
    if (fitnessSearch.rows.length > 0) {
      fitnessSearch.rows.forEach(t => console.log(`  - ${t.table_schema}.${t.table_name}`));
    } else {
      console.log('  No fitness-related tables found');
    }

    // Count rows in public.users with date breakdown
    console.log('\n👥 USER RECORDS (DETAILED):');
    const userDetails = await query(`
      SELECT
        COUNT(*) as total,
        MIN(created_at) as earliest,
        MAX(created_at) as latest,
        COUNT(DISTINCT DATE(created_at)) as days_with_signups
      FROM users
    `);
    console.log(`  Total: ${userDetails.rows[0].total}`);
    console.log(`  Earliest: ${userDetails.rows[0].earliest}`);
    console.log(`  Latest: ${userDetails.rows[0].latest}`);
    console.log(`  Days with signups: ${userDetails.rows[0].days_with_signups}`);

    // Count rows in public.entries with extensive date analysis
    console.log('\n📝 ENTRY RECORDS (DETAILED):');
    const entryDetails = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users,
        MIN(entry_date) as earliest_date,
        MAX(entry_date) as latest_date,
        MIN(created_at) as earliest_created,
        MAX(created_at) as latest_created,
        COUNT(DISTINCT entry_date) as unique_dates
      FROM entries
    `);
    console.log(`  Total entries: ${entryDetails.rows[0].total}`);
    console.log(`  Unique users: ${entryDetails.rows[0].unique_users}`);
    console.log(`  Date range: ${entryDetails.rows[0].earliest_date} to ${entryDetails.rows[0].latest_date}`);
    console.log(`  Created range: ${entryDetails.rows[0].earliest_created} to ${entryDetails.rows[0].latest_created}`);
    console.log(`  Unique workout dates: ${entryDetails.rows[0].unique_dates}`);

    // Check if there are any deleted/archived flags
    console.log('\n🔍 CHECKING FOR SOFT-DELETE OR ARCHIVE COLUMNS:');
    const softDeleteCols = await query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND (
        column_name ILIKE '%delete%' OR
        column_name ILIKE '%archive%' OR
        column_name ILIKE '%active%' OR
        column_name ILIKE '%disabled%'
      )
    `);
    if (softDeleteCols.rows.length > 0) {
      softDeleteCols.rows.forEach(c => console.log(`  ${c.table_name}.${c.column_name}`));

      // Check if any entries are soft-deleted
      for (const col of softDeleteCols.rows) {
        const checkDeleted = await query(`
          SELECT COUNT(*) as count
          FROM ${col.table_name}
        `);
        console.log(`    ${col.table_name}: ${checkDeleted.rows[0].count} total rows`);
      }
    } else {
      console.log('  No soft-delete columns found');
    }

    // Check database for any views that might contain historical data
    console.log('\n👁️ DATABASE VIEWS:');
    const views = await query(`
      SELECT table_schema, table_name
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    `);
    if (views.rows.length > 0) {
      views.rows.forEach(v => console.log(`  - ${v.table_schema}.${v.table_name}`));
    } else {
      console.log('  No custom views found');
    }

    // Check for any materialized views
    console.log('\n📊 MATERIALIZED VIEWS:');
    const matViews = await query(`
      SELECT schemaname, matviewname
      FROM pg_matviews
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);
    if (matViews.rows.length > 0) {
      matViews.rows.forEach(v => console.log(`  - ${v.schemaname}.${v.matviewname}`));
    } else {
      console.log('  No materialized views found');
    }

    // Look for any sequences that might indicate deleted rows
    console.log('\n🔢 SEQUENCE VALUES (indicates total records ever created):');
    const sequences = await query(`
      SELECT sequence_schema, sequence_name,
             last_value, start_value, increment_by
      FROM information_schema.sequences
      JOIN pg_sequences ON pg_sequences.schemaname = sequence_schema
                       AND pg_sequences.sequencename = sequence_name
      WHERE sequence_schema = 'public'
    `);
    if (sequences.rows.length > 0) {
      sequences.rows.forEach(s => {
        console.log(`  ${s.sequence_name}:`);
        console.log(`    Current value: ${s.last_value}`);
        console.log(`    Start value: ${s.start_value}`);
        const recordsCreated = s.last_value - s.start_value + 1;
        console.log(`    Total records ever created: ~${recordsCreated}`);
      });
    } else {
      console.log('  No sequences found');
    }

    // Check table sizes
    console.log('\n💾 TABLE SIZES:');
    const tableSizes = await query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);
    tableSizes.rows.forEach(t => {
      console.log(`  ${t.tablename}:`);
      console.log(`    Total: ${t.total_size} (Table: ${t.table_size}, Indexes: ${t.indexes_size})`);
    });

    console.log('\n✅ Deep search complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

deepSearch();
