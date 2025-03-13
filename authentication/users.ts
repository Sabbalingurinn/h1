import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import xss from 'xss';
import { z } from 'zod';

const prisma = new PrismaClient();
const app = new Hono();
const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '11', 10);

const userSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email().max(64),
  password: z.string().min(8),
  admin: z.boolean().optional(),
});

app.post('/users', async (c) => {
  const body = await c.req.json();
  const result = userSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: result.error.errors }, 400);
  }

  const { username, email, password, admin = false } = result.data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existingUser) {
    return c.json({ error: 'Username or email already exists' }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, bcryptRounds);

  const user = await prisma.user.create({
    data: {
      username: xss(username),
      email: xss(email),
      password: hashedPassword,
      admin,
    },
  });

  return c.json({ id: user.id, username: user.username, email: user.email, admin: user.admin });
});

app.get('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, admin: true, created: true, updated: true },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user);
});

app.put('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const email = body.email ? xss(body.email) : undefined;
  const password = body.password ? await bcrypt.hash(body.password, bcryptRounds) : undefined;

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      email,
      password,
      updated: new Date(),
    },
    select: { id: true, username: true, email: true, admin: true, created: true, updated: true },
  });

  return c.json(updatedUser);
});

app.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  await prisma.user.delete({ where: { id } });

  return c.json({ message: 'User deleted successfully' });
});

export default app;
