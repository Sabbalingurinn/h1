import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth, adminOnly } from '../middleware/auth';

const prisma = new PrismaClient();
const users = new Hono();

users.get('/', async (c) => {
  const allUsers = await prisma.user.findMany({ select: { username: true } });
  return c.json(allUsers);
});

users.get('/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? c.json(user) : c.notFound();
});

users.post('/', async (c) => {
  const data = await c.req.json();
  const user = await prisma.user.create({ data });
  return c.json(user);
});

users.patch('/:userId', auth, async (c) => {
  const user = c.get('user');
  const userId = Number(c.req.param('userId'));
  if (user.id !== userId) {
    return c.json({ error: 'Unauthorized' }, 403);
  }
  const data = await c.req.json();
  const updatedUser = await prisma.user.update({ where: { id: userId }, data });
  return c.json(updatedUser);
});

users.delete('/:id', auth, adminOnly, async (c) => {
  const id = Number(c.req.param('id'));
  await prisma.user.delete({ where: { id } });
  return c.json({ message: 'User deleted successfully' });
});

export default users;
