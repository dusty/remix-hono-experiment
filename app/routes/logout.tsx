import type { ActionArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'

export async function action({ request, context }: ActionArgs) {
  return redirect('/session', { headers: { 'set-cookie': await context.destroySession() } })
}