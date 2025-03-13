// middleware/auth.ts
import type { Context, Next } from 'hono';
import type { AppContext, UserPayload } from '../context.js';
import { verify } from 'hono/jwt';
export async function auth(c: AppContext, next: Next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const payload = (await verify(token, process.env.JWT_SECRET as string)) as unknown as UserPayload;
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

export async function adminOnly(c: Context, next: Next) {
  const user = c.get('user') as UserPayload;
  if (!user?.admin) return c.json({ error: 'Admin access required' }, 403);
  await next();
}
