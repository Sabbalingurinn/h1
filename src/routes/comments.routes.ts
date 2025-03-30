import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

import { auth, adminOnly } from '../middleware/auth.js';


const prisma = new PrismaClient();
const comments = new Hono();

comments.get('/:articleId', async (c) => {
  const articleId = Number(c.req.param('articleId'));

  const articleComments = await prisma.comment.findMany({
    where: { articleId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  return c.json(articleComments);
});


comments.get('/users/:userId/comments', async (c) => {
  const userId = Number(c.req.param('userId'));

  const userComments = await prisma.comment.findMany({
    where: { userId },
    include: {
      article: {
        select: {
          id: true,
          articlename: true,
        },
      },
    },
  });

  return c.json(userComments);
});


comments.post('/', auth, async (c) => {
  const user = c.get('user'); // Authenticated user info
  const { articleId, content } = await c.req.json();

  if (!articleId || !content) {
    return c.json({ error: 'Article ID and content are required' }, 400);
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        articleId: Number(articleId),
        content,
        userId: user.id,
      },
    });

    return c.json(comment, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create comment', details: err }, 500);
  }
});

comments.delete('/:commentId', auth, adminOnly, async (c) => {
  const commentId = Number(c.req.param('commentId'));
  await prisma.comment.delete({ where: { id: commentId } });
  return c.json({ message: 'Comment deleted successfully' });
});

export default comments;
