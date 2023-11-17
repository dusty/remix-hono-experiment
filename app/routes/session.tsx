import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const saved = context.session.get('saved')
  return json({ saved })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const saved = formData.get('saved')
  context.session.set('saved', saved)
  return redirect('.')
}

export default function SessionRoute() {
  const { saved } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>saved: {saved}</h1>
      <Form method="POST">
        <input
          type="text"
          name="saved"
          defaultValue={saved}
          required
        />
        <button type="submit">Save</button>
      </Form>
    </div>
  )
}
