import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import * as build from '@remix-run/dev/server-build'
import { logDevReady } from '@remix-run/node'
import { Hono, MiddlewareHandler } from 'hono'
import { logger } from 'hono/logger'
import { remix } from 'remix-hono/handler'

const NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

/* type your Hono variables (used with ctx.get/ctx.set) here */
type Variables = {}

type ContextEnv = { Variables: Variables }

const app = new Hono<ContextEnv>()

// cache hashed assets for 1y
app.use('/build/*', cache(60 * 60 * 24 * 365), serveStatic({ root: './public', index: '' }))

// cache other assets for 1 hour
app.use('/static/*', cache(60 * 60), serveStatic({ root: './public', index: '' }))

// log non-assets requests
app.use('*', logger())

// pass to remix
app.use(
  '*',
  remix({
    build,
    mode: NODE_ENV,
    getLoadContext(ctx) {
      return ctx.env
    },
  })
)

serve(app, () => {
  if (NODE_ENV === 'development') logDevReady(build)
})

function cache(seconds: number): MiddlewareHandler {
  return async function setCache(c, next) {
    await next()
    c.res.headers.set('cache-control', `public, max-age=${seconds}`)
  }
}
