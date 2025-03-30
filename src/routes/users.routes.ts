// users.routes.ts
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth, adminOnly } from '../middleware/auth.js';
import type { Context } from 'hono';
import type { UserPayload } from '../context.js';

const prisma = new PrismaClient();
const users = new Hono();

users.get('/', async (c) => {
  const allUsers = await prisma.user.findMany({ select: { username: true, id: true } });
  return c.json(allUsers);
});

users.get('/:userId', async (c) => {
  const userId = Number(c.req.param('userId'));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? c.json(user) : c.notFound();
});


users.patch('/:userId', auth, async (c: Context) => {
  const userId = Number(c.req.param('userId'));
  const loggedUser = c.get('user') as UserPayload; // <-- explicit typing here

  if (loggedUser.id !== userId) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const data = await c.req.json();
  const updatedUser = await prisma.user.update({ where: { id: userId }, data });
  return c.json(updatedUser);
});

users.delete('/:id', auth, adminOnly, async (c) => {
  const id = Number(c.req.param('id'));

  try {
    // Delete comments associated with the user
    await prisma.comment.deleteMany({
      where: { userId: id },
    });

    // Delete articles associated with the user
    await prisma.article.deleteMany({
      where: { userId: id },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id },
    });

    return c.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Deletion failed:', error);
    return c.json({ error: 'Failed to delete user and associated data' }, 500);
  }
});

users.get('/:userId/articles', async (c) => {
  const userId = parseInt(c.req.param('userId'), 10);

  if (isNaN(userId)) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }

  const userArticles = await prisma.article.findMany({
    where: { userId },
  });

  return c.json(userArticles);
});

export default users;
