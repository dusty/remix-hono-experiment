import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ context }: LoaderFunctionArgs) {
  return json({ test123: context.env.TEST123 })
}

export default function OneRoute() {
  const { test123 } = useLoaderData<typeof loader>()
  return (
    <div>
      <p>One: {test123}</p>
    </div>
  )
}
