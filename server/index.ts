import { createServer } from './server'

createServer({
  isProduction: process.env.NODE_ENV === 'production',
  session: { key: 'test123', secret: 'test456' },
})
