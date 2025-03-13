import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth, adminOnly } from '../middlewear/auth.js';

const prisma = new PrismaClient();
const comments = new Hono();

comments.get('/:articleId', async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const articleComments = await prisma.comment.findMany({ where: { articleId } });
  return c.json(articleComments);
});

comments.get('/users/:userId/comments', async (c) => {
  const userId = Number(c.req.param('userId'));
  const userComments = await prisma.comment.findMany({ where: { userId } });
  return c.json(userComments);
});

comments.post('/', async (c) => {
  const data = await c.req.json(); // Allow unauthenticated comments
  const comment = await prisma.comment.create({ data });
  return c.json(comment);
});

comments.delete('/:commentId', auth, adminOnly, async (c) => {
  const commentId = Number(c.req.param('commentId'));
  await prisma.comment.delete({ where: { id: commentId } });
  return c.json({ message: 'Comment deleted successfully' });
});

export default comments;
