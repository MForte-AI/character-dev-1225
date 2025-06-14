import { Pool, QueryResult } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const db = {
  query: (text: string, params?: any[]): Promise<QueryResult> => pool.query(text, params),
  getClient: () => pool.connect(),
  end: () => pool.end(),
}

// Test connection function
export const testConnection = async () => {
  try {
    const result = await db.query('SELECT NOW() as current_time')
    console.log('Database connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export default db 