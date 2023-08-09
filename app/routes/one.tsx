import { json } from '@remix-run/node'
import { Nav } from '~/components/Nav'

export async function loader() {
  return json('ok')
}

export default function OneRoute() {
  return (
    <div>
      <Nav />
      <p>One</p>
    </div>
  )
}
