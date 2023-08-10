/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
/// <reference types="@remix-run/server-runtime" />

import type { Session } from '@remix-run/node';

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    env: Record<string, string>
    session: Session
    destroySession: () => Promise<string>
  }
}
