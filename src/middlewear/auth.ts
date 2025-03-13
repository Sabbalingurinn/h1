import { Context, Next } from 'hono';

export async function auth(c: Context, next: Next) {
  // pseudo-logic, implement your JWT or session logic here
  const user = /* your logic to get authenticated user */;
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', user);
  await next();
}

export async function adminOnly(c: Context, next: Next) {
  const user = c.get('user');
  if (!user || !user.admin) {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}
