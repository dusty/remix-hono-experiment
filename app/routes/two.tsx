import type { LoaderArgs } from '@remix-run/node'
import { Headers, json } from '@remix-run/node'
import { Nav } from '~/components/Nav'

export async function loader({ request }: LoaderArgs) {
  const headers = new Headers()
  headers.set('set-cookie', 'test1=yes')
  headers.append('set-cookie', 'test2=yes')
  return json('ok', { headers })
}

export default function TwoRoute() {
  return (
    <div>
      <Nav />
      <p>Two</p>
    </div>
  )
}
