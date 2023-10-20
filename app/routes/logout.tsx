import type { ActionFunctionArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'

export async function action({ context }: ActionFunctionArgs) {
  context.destroySession()
  return redirect('/')
}
