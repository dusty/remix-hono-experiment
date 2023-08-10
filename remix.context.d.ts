import type { Session } from '@remix-run/node'

declare module '@remix-run/server-runtime' {
  export interface AppLoadContext {
    env: Record<string, string>
    session: Session
    destroySession: () => Promise<string>
  }
}
