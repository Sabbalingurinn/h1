import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { findUserByUsername, createUser, comparePasswords } from '../services/userservice.js';
import { isNotEmptyString } from '../utils/validation.js';

const authRoutes = new Hono();



authRoutes.post('/register', async (c) => {
  const { username, password, email } = await c.req.json();

  const existingUserByUsername = await findUserByUsername(username);

  if (existingUserByUsername) {
    return c.json({ error: 'Username already exists' }, 400);
  }

  const user = await createUser(username, email, password);
  delete (user as any).password;

  return c.json(user, 201);
});



authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json();

  const user = await findUserByUsername(username);
  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  const passwordValid = await comparePasswords(password, user.password);
  if (!passwordValid) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  // Add expiration to payload directly
  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
  const payload = { 
    id: user.id, 
    admin: user.admin, 
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds 
  };

  const token = await sign(payload, process.env.JWT_SECRET as string, 'HS256');

  delete (user as any).password;

  return c.json({ user, token, expiresIn: expiresInSeconds });
});

export default authRoutes;
