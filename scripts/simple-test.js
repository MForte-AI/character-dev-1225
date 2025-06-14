const { Pool } = require('pg')
const { Storage } = require('@google-cloud/storage')
require('dotenv').config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('📊 Testing database connection...')
  console.log('DB_HOST:', process.env.DB_HOST)
  console.log('DB_PORT:', process.env.DB_PORT)
  console.log('DB_NAME:', process.env.DB_NAME)
  console.log('DB_USER:', process.env.DB_USER)
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]')

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
  })

  try {
    const result = await pool.query(`
      SELECT NOW() as current_time, 
             COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    
    console.log('✅ Database connection successful!')
    console.log('📅 Current time:', result.rows[0].current_time)
    console.log('📊 Tables created:', result.rows[0].table_count)
    
    await pool.end()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

async function testStorageConnection() {
  console.log('\n📁 Testing Google Cloud Storage connection...')
  
  try {
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'ps-sandbox-agent',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })

    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'gs-team-assistant-fe-v1'
    const bucket = storage.bucket(bucketName)
    
    const [exists] = await bucket.exists()
    console.log('✅ Google Cloud Storage connection successful!')
    console.log('📦 Bucket exists:', exists)
    return exists
  } catch (error) {
    console.error('❌ Storage connection failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Testing ChatBot UI connections...\n')
  
  const dbResult = await testDatabaseConnection()
  const storageResult = await testStorageConnection()
  
  console.log('\n🎯 Results:')
  console.log(`Database: ${dbResult ? '✅ Connected' : '❌ Failed'}`)
  console.log(`Storage: ${storageResult ? '✅ Connected' : '❌ Failed'}`)
  
  if (dbResult && storageResult) {
    console.log('\n🎉 All connections successful! Migration complete!')
  } else {
    console.log('\n⚠️  Some connections failed. Check configuration.')
  }
}

main().catch(console.error) 