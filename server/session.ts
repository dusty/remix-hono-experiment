import { createCookie, createFileSessionStorage } from '@remix-run/node'
import path from 'path'
import { createRedisSessionStorage } from './storage'

export interface CreateSessionStorageArgs {
  session: {
    key: string
    secret: string
    maxAge?: number
  }
  redis?: {
    host: string
    port?: number
    password?: string
  }
}
export function createSessionStorage({ session, redis }: CreateSessionStorageArgs) {
  if (!session.key || !session.secret) throw new Error('Session KEY and SECRET required.')

  const sessionCookie = createCookie(session.key, {
    secure: true,
    secrets: [session.secret],
    sameSite: 'none',
    maxAge: 60 * 60 * 24,
    httpOnly: true,
  })

  const sessionStorage = redis?.host
    ? createRedisSessionStorage({
        cookie: sessionCookie,
        options: {
          host: redis.host,
          keyPrefix: session.key,
          password: redis.password,
          port: redis?.port ?? 6379,
        },
      })
    : createFileSessionStorage({
        cookie: sessionCookie,
        dir: path.join(process.cwd(), 'tmp'),
      })

  return { sessionCookie, sessionStorage }
}
