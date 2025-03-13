// src/types/context.ts
import type { Context } from 'hono';

export interface UserPayload {
  id: number;
  admin: boolean;
}

export type AppContext = Context<{
  Variables: {
    user: UserPayload;
  };
}>;
