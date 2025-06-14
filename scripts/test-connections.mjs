import { Pool } from 'pg'
import { Storage } from '@google-cloud/storage'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testDatabaseConnection() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
  })

  try {
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'')
    console.log('Database connection successful!')
    console.log('Current time:', result.rows[0].current_time)
    console.log('Tables created:', result.rows[0].table_count)
    await pool.end()
    return true
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return false
  }
}

async function testStorageConnection() {
  try {
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'ps-sandbox-agent',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })

    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'gs-team-assistant-fe-v1'
    const bucket = storage.bucket(bucketName)
    
    const [exists] = await bucket.exists()
    console.log('Google Cloud Storage connection successful!')
    console.log(`Bucket ${bucketName} exists:`, exists)
    return exists
  } catch (error) {
    console.error('Storage connection failed:', error.message)
    return false
  }
}

async function testAllConnections() {
  console.log('🧪 Testing connections...\n')
  
  // Test database connection
  console.log('📊 Testing database connection...')
  const dbResult = await testDatabaseConnection()
  console.log(`Database: ${dbResult ? '✅ Connected' : '❌ Failed'}`)
  
  // Test storage connection
  console.log('\n📁 Testing Google Cloud Storage connection...')
  const storageResult = await testStorageConnection()
  console.log(`Storage: ${storageResult ? '✅ Connected' : '❌ Failed'}`)
  
  console.log('\n🎯 Connection test complete!')
  
  if (dbResult && storageResult) {
    console.log('✅ All connections successful! Ready to proceed.')
  } else {
    console.log('❌ Some connections failed. Please check your configuration.')
  }
  
  process.exit(0)
}

testAllConnections().catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
}) 