import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import * as build from '@remix-run/dev/server-build'
import type { AppLoadContext, Session } from '@remix-run/node'
import { broadcastDevReady, createRequestHandler } from '@remix-run/node'
import crypto from 'crypto'
import type { MiddlewareHandler } from 'hono'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { logger } from 'hono/logger'
import type { CreateSessionStorageArgs } from './session'
import { createSessionStorage } from './session'

type ContextEnv = {
  Variables: {
    session: Session
    destroySession: boolean
    requestId: string
  }
}

interface CreateServerArgs extends CreateSessionStorageArgs {
  mode: 'development' | 'production' | 'test'
  prefix?: string
}

export function createServer({ mode, session, redis }: CreateServerArgs) {
  const handleRemix = createRequestHandler(build, mode)
  const { sessionStorage } = createSessionStorage({ session, redis })
  const app = new Hono<ContextEnv>()

  // TODO: handle public prefix

  // cache hashed assets for 1y
  app.use('/build/*', cache(60 * 60 * 24 * 365), serveStatic({ root: './public', index: '' }))

  // cache other assets for 1 hour
  app.use('/static/*', cache(60 * 60), serveStatic({ root: './public', index: '' }))

  // set requestId
  app.use(async (c, next) => {
    c.set('requestId', createId())
    await next()
  })

  // log non-static requests
  // TODO: make a better logger that also adds the requestId to it
  app.use('*', logger())

  // manage sessions
  app.use('*', async function (c, next) {
    const session = await sessionStorage.getSession(c.req.raw.headers.get('cookie'))
    c.set('session', session)
    c.set('destroySession', false)
    await next()
    if (c.get('destroySession')) {
      c.header('set-cookie', await sessionStorage.destroySession(session), { append: true })
      const newSession = await sessionStorage.getSession(c.req.raw.headers.get('cookie'))
      newSession.set('csrfToken', createId())
      c.header('set-cookie', await sessionStorage.commitSession(newSession), { append: true })
    } else {
      if (!session.get('csrfToken')) session.set('csrfToken', createId())
      c.header('set-cookie', await sessionStorage.commitSession(session), { append: true })
    }
  })

  // pass to remix
  app.use('*', async (c) => {
    const loadContext: AppLoadContext = {
      env: env(c),
      session: c.get('session'),
      destroySession: () => c.set('destroySession', true),
      requestId: c.get('requestId'),
    }
    return handleRemix(c.req.raw, loadContext)
  })

  // start app, broadcast devReady in dev mode
  serve(app, () => {
    if (mode !== 'production') broadcastDevReady(build)
  })
}

// add cache header to the response
function cache(seconds: number): MiddlewareHandler {
  return async function setCache(c, next) {
    await next()
    c.res.headers.set('cache-control', `public, max-age=${seconds}`)
  }
}

function createId() {
  return crypto.randomUUID({ disableEntropyCache: true })
}
