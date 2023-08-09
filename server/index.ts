import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import * as build from '@remix-run/dev/server-build'
import type { AppLoadContext, Session, SessionStorage } from '@remix-run/node'
import { createRequestHandler, logDevReady } from '@remix-run/node'
import { Hono, MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { logger } from 'hono/logger'
import { sessionStorage } from './session'

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const handleRemix = createRequestHandler(build, NODE_ENV)

type ContextEnv = {
  Variables: {
    sessionStorage: SessionStorage
    session: Session
  }
}

const app = new Hono<ContextEnv>()

// cache hashed assets for 1y
app.use('/build/*', cache(60 * 60 * 24 * 365), serveStatic({ root: './public', index: '' }))

// cache other assets for 1 hour
app.use('/static/*', cache(60 * 60), serveStatic({ root: './public', index: '' }))

// log non-static requests
app.use('*', logger())

// manage sessions
app.use('*', async function (c, next) {
  c.set('sessionStorage', sessionStorage)
  const session = await sessionStorage.getSession(c.req.headers.get('cookie'))
  c.set('session', session)
  await next()
  c.header('set-cookie', await sessionStorage.commitSession(session))
})

// pass to remix
app.use('*', async (c) => {
  const loadContext: AppLoadContext = {
    env: env(c),
    session: c.get('session'),
    sessionStorage: c.get('sessionStorage'),
  }
  return handleRemix(c.req.raw, loadContext)
})

// start app, broadcast devReady in dev mode
serve(app, () => {
  if (NODE_ENV === 'development') logDevReady(build)
})

// add cache header to the response
function cache(seconds: number): MiddlewareHandler {
  return async function setCache(c, next) {
    await next()
    c.res.headers.set('cache-control', `public, max-age=${seconds}`)
  }
}
