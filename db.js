const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DBConnection = async () => {
    try {
      // Try to connect and run a simple query
      await pool.query('SELECT NOW()');
      console.log('Database connected successfully!');
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
    }
  };
  
  // Call the testConnection function
  DBConnection();

// Export the pool instance for database queries
module.exports = pool;
