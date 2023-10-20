import { cssBundleHref } from '@remix-run/css-bundle'
import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { Nav } from './components/Nav'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader({ context }: LoaderFunctionArgs) {
  return json({ csrfToken: context.session.get('csrfToken') })
}

export default function App() {
  const { csrfToken } = useLoaderData<typeof loader>()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="shortcut icon"
          href="/static/favicon.ico"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Nav />
        <p>{csrfToken}</p>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        <link
          rel="shortcut icon"
          href="/static/favicon.ico"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <Nav />
          <h1>Error Boundary</h1>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
