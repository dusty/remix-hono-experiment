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
import { sessionStorage } from './session'

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const handleRemix = createRequestHandler(build, NODE_ENV)

type ContextEnv = {
  Variables: {
    session: Session
    destroySession?: boolean
    requestId: string
  }
}

const app = new Hono<ContextEnv>()

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
app.use('*', logger())

// manage sessions
app.use('*', async function (c, next) {
  const session = await sessionStorage.getSession(c.req.raw.headers.get('cookie'))
  c.set('session', session)
  await next()
  if (!c.res.headers.get('set-cookie')) {
    if (!session.get('csrfToken')) session.set('csrfToken', createId())
    const cookie = c.get('destroySession')
      ? await sessionStorage.destroySession(session)
      : await sessionStorage.commitSession(session)
    c.res.headers.set('set-cookie', cookie)
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
  if (NODE_ENV === 'development') broadcastDevReady(build)
})

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
