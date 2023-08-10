import { createCookie, createFileSessionStorage } from '@remix-run/node'
import path from 'path'
import { createRedisSessionStorage } from './storage'

const COOKIE_KEY = 'session'

export const sessionCookie = createCookie('session', {
  secure: true,
  secrets: ['secret'],
  sameSite: 'none',
  maxAge: 60 * 60 * 24,
  httpOnly: true,
})

export const sessionStorage = process.env.REDIS_SERVICE_HOST
  ? createRedisSessionStorage({
      cookie: sessionCookie,
      options: {
        host: process.env.REDIS_SERVICE_HOST,
        keyPrefix: process.env.REDIS_KEY_PREFIX ?? `${COOKIE_KEY}:`,
        password: process.env.REDIS_PASSWORD ?? undefined,
        port: process.env.REDIS_SERVICE_PORT ? Number(process.env.REDIS_SERVICE_PORT) : 6379,
      },
    })
  : createFileSessionStorage({
      cookie: sessionCookie,
      dir: path.join(process.cwd(), 'tmp'),
    })
