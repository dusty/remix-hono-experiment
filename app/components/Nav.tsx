import { Link } from '@remix-run/react'

export function Nav() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/one">One</Link>
      </li>
      <li>
        <Link to="/two">Two</Link>
      </li>
      <li>
        <Link to="/session">Session</Link>
      </li>
      <li>
        <Link to="/three">Not Found</Link>
      </li>
    </ul>
  )
}
