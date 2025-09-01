#!/usr/bin/env node

/**
 * SafeRoute Database Setup Script
 * This script initializes the PostgreSQL database for SafeRoute application
 */

import { exec } from 'child_process';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbName = 'saferoute_db';
const connectionString = process.env.DIRECT_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Parse connection string to get credentials
const parseConnectionString = (connStr) => {
  try {
    const url = new URL(connStr);
    return {
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.substring(1).split('?')[0]
    };
  } catch (error) {
    throw new Error('Invalid PostgreSQL connection string format: ' + error.message);
  }
};

const credentials = parseConnectionString(connectionString);

// Connect to default PostgreSQL database
const client = new Client({
  user: credentials.user,
  host: credentials.host,
  password: credentials.password,
  port: credentials.port,
  database: 'postgres' // Connect to default database first
});

async function setupDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    
    // Check if database exists
    const checkDbResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1', [dbName]
    );
    
    if (checkDbResult.rows.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    
    // Disconnect from default database
    await client.end();
    
    // Connect to the SafeRoute database
    const safeRouteClient = new Client({
      user: credentials.user,
      host: credentials.host,
      password: credentials.password,
      port: credentials.port,
      database: dbName
    });
    
    await safeRouteClient.connect();
    
    // Enable PostGIS extension if not already enabled
    console.log('Checking PostGIS extension...');
    try {
      const checkPostgisResult = await safeRouteClient.query(
        "SELECT 1 FROM pg_extension WHERE extname = 'postgis'"
      );
      
      if (checkPostgisResult.rows.length === 0) {
        console.log('Enabling PostGIS extension...');
        await safeRouteClient.query('CREATE EXTENSION IF NOT EXISTS postgis');
        console.log('PostGIS extension enabled successfully.');
      } else {
        console.log('PostGIS extension is already enabled.');
      }
    } catch (error) {
      console.log('PostGIS extension not available. Skipping...');
    }
    
    await safeRouteClient.end();
    
    // Run Prisma migrations
    console.log('Running Prisma migrations...');
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Prisma migrations: ${error.message}`);
        return;
      }
      
      if (stderr) {
        console.error(`Prisma migration stderr: ${stderr}`);
        return;
      }
      
      console.log(`Prisma migrations applied successfully:
${stdout}`);
      
      // Generate Prisma client
      console.log('Generating Prisma client...');
      exec('npx prisma generate', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating Prisma client: ${error.message}`);
          return;
        }
        
        if (stderr) {
          console.error(`Prisma client generation stderr: ${stderr}`);
          return;
        }
        
        console.log(`Prisma client generated successfully:
${stdout}`);
        console.log('Database setup completed successfully!');
      });
    });
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();