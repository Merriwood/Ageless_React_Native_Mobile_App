#!/usr/bin/env node

// Quick database connection test script
import dotenv from 'dotenv';
import { query } from './server/db.js';

dotenv.config();

console.log('🔍 Testing Database Connection...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log('Database host:', url.hostname);
  console.log('Database port:', url.port);
  console.log('Database name:', url.pathname.slice(1));
  console.log('SSL required:', process.env.NODE_ENV === 'production');
}

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const result = await query('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Connection successful');
    console.log('Timestamp:', result.rows[0].timestamp);

    // Test users table exists
    console.log('\n2. Testing users table...');
    const usersTest = await query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table accessible, count:', usersTest.rows[0].count);

    // Test entries table exists
    console.log('\n3. Testing entries table...');
    const entriesTest = await query('SELECT COUNT(*) as count FROM entries');
    console.log('✅ Entries table accessible, count:', entriesTest.rows[0].count);

    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('\n💡 Suggestion: Run database migration to create tables');
      console.error('Command: npm run migrate');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('\n💡 Suggestion: Check DATABASE_URL and database service status');
    } else if (error.code === '28P01') {
      console.error('\n💡 Suggestion: Check database credentials in DATABASE_URL');
    }
  }
  
  process.exit(0);
}

testConnection();
