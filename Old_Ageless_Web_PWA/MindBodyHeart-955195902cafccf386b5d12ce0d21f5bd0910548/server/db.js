import pg from "pg";
const { Pool } = pg;

// Database connection with proper fallback handling
let pool;

// Helper function to create pool with manual config
function createManualPool(dbUrl) {
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Creating pool with manual configuration...");
    console.log("🔗 Parsing URL:", dbUrl?.substring(0, 30) + "...");
  }
  
  // More flexible regex to handle different URL formats
  const matches = dbUrl.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/([^?]+)(?:\?.*)?$/);
  
  if (!matches) {
    console.error("❌ Cannot parse DATABASE_URL with regex");
    if (process.env.NODE_ENV !== "production") {
      console.error("URL format:", dbUrl?.substring(0, 50));
    }
    throw new Error("Cannot parse DATABASE_URL manually - invalid format");
  }
  
  const [, user, password, host, port, database] = matches;
  
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Extracted connection details:");
    console.log("  Host:", host);
    console.log("  Port:", port || "5432 (default)");
    console.log("  Database:", database);
    console.log("  User:", user);
  }
  
  const config = {
    user: user,
    password: password,
    host: host,
    port: parseInt(port) || 5432,
    database: database,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 Creating pool with config:", {
      ...config,
      password: "***hidden***"
    });
  }
  
  return new Pool(config);
}

if (process.env.DATABASE_URL) {
  // IMMEDIATE MANUAL PARSING - Skip connectionString due to searchParams bug
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Using PostgreSQL database with DATABASE_URL");
    console.log("🔧 Using manual parsing to avoid searchParams error");
  }
  
  try {
    pool = createManualPool(process.env.DATABASE_URL);
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Manual database configuration successful");
    }
  } catch (manualError) {
    console.error("❌ Manual configuration failed:", manualError.message);
    
    // As absolute last resort, try connectionString
    try {
      let connectionString = process.env.DATABASE_URL;
      
      // Ensure the URL has the correct protocol
      if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
        console.log("🔧 Fixing DATABASE_URL protocol");
        connectionString = connectionString.replace(/^[^:]+:\/\//, 'postgresql://');
      }
      
      if (process.env.NODE_ENV !== "production") {
        console.log("🔗 Database URL protocol:", connectionString.split('://')[0]);
        console.log("🔄 Last resort: trying connectionString approach...");
      }
      
      pool = new Pool({
        connectionString: connectionString,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      console.log("✅ Pool created with connectionString (last resort)");
      
    } catch (poolError) {
      console.error("❌ All database configuration methods failed");
      throw new Error("Cannot create database pool: " + poolError.message);
    }
  }
} else {
  console.warn("⚠️  DATABASE_URL not found. Checking for alternative connection strings...");
  console.log("Available database env vars:", Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('POSTGRES') || key.includes('DB_')
  ));
  
  // Try alternative environment variable names that Render might use
  const altConnectionString = process.env.POSTGRES_URL || 
                              process.env.POSTGRESQL_URL || 
                              process.env.DB_URL ||
                              process.env.DATABASE_CONNECTION_STRING;
  
  if (altConnectionString) {
    console.log("✅ Found alternative database connection");
    pool = new Pool({
      connectionString: altConnectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
  } else {
    console.error("❌ No database connection available - using dummy connection");
    // Create a dummy pool that will fail gracefully for now
    pool = new Pool({
      connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
      ssl: false
    });
  }
}

export async function query(sql, params = []) {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("📊 Executing query:", sql.substring(0, 50) + "...");
    }
    
    // Add retry logic for connection issues
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const client = await pool.connect();
        try {
          const result = await client.query(sql, params);
          if (process.env.NODE_ENV !== "production") {
            console.log("✅ Database query successful, rows:", result.rowCount);
          }
          return result;
        } finally {
          client.release();
        }
      } catch (connError) {
        lastError = connError;
        
        // Check for specific errors that might be fixable
        if (connError.message.includes('searchParams') || 
            connError.message.includes('Cannot read properties of undefined') ||
            connError.code === 'ECONNREFUSED' || 
            connError.code === 'ENOTFOUND') {
          console.error("🔧 Detected connection error, attempting to recreate pool...");
          
          // ALWAYS use manual configuration - never connectionString
          if (process.env.DATABASE_URL && retries === 1) { // Only try once
            try {
              await pool.end();
              pool = createManualPool(process.env.DATABASE_URL);
              console.log("🔄 Pool recreated with manual configuration");
              retries--; // Try again with the new pool
              continue;
            } catch (recreateError) {
              console.error("❌ Pool recreation failed:", recreateError.message);
            }
          }
        }
        
        // For other errors, don't retry
        throw connError;
      }
    }
    
    throw lastError;
    
  } catch (error) {
    console.error("❌ Database query error:", error.message);
    console.error("Query:", sql);
    console.error("Params:", params);
    
    // Log specific connection issues
    if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
      console.error("🔥 Database connection failed - check DATABASE_URL and database service");
    } else if (error.message.includes('searchParams') || 
               error.message.includes('Cannot read properties of undefined')) {
      console.error("🔥 Database URL parsing error - check DATABASE_URL format");
      console.error("DATABASE_URL length:", process.env.DATABASE_URL?.length || 'undefined');
      console.error("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20) || 'undefined');
    }
    
    throw error;
  }
}

// Test the database connection
async function testConnection() {
  let client;
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("🔍 Testing database connection...");
    }
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log("✅ Database connection successful");
    if (process.env.NODE_ENV !== "production") {
      console.log("🔗 PostgreSQL version:", result.rows[0].version.split(' ')[0]);
    }
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    if (error.message.includes('searchParams')) {
      console.error("🔥 This is the searchParams error - implementing workaround...");
    }
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Initialize database on module load
(async () => {
  if (pool && process.env.DATABASE_URL) {
    if (process.env.NODE_ENV !== "production") {
      console.log("🚀 Initializing database connection test...");
    }
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Initial database connection failed - application may have limited functionality");
    }
  } else {
    console.warn("⚠️ No database URL configured - running in offline mode");
  }
})();
