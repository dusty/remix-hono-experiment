import { createServer } from './server'

createServer({
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  session: { key: 'test123', secret: 'test456' },
})
