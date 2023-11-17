import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers()
  headers.set('set-cookie', `test1=${new Date().toISOString()}`)
  headers.append('set-cookie', `test2=${new Date().toISOString()}`)
  return json('ok', { headers })
}

export default function TwoRoute() {
  return (
    <div>
      <p>Two</p>
    </div>
  )
}
