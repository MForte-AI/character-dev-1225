const { testConnection } = require('../lib/database/client.ts')
const { testStorageConnection } = require('../lib/storage/google-cloud.ts')

async function testAllConnections() {
  console.log('🧪 Testing connections...\n')
  
  // Test database connection
  console.log('📊 Testing database connection...')
  const dbResult = await testConnection()
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

testAllConnections().catch(console.error) 