import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

import { auth } from '../middleware/auth.js';


const prisma = new PrismaClient();
const tags = new Hono();

tags.get('/', async (c) => {
  const allTags = await prisma.tag.findMany();
  return c.json(allTags);
});

tags.get('/:tagName/articles', async (c) => {
  const tagName = c.req.param('tagName');
  const articles = await prisma.article.findMany({
    where: { tags: { some: { tag: { name: tagName } } } },
  });
  return c.json(articles);
});

tags.post('/', auth, async (c) => {
  const data = await c.req.json();
  const tag = await prisma.tag.create({ data });
  return c.json(tag);
});

// tags.routes.ts or similar
tags.post('/:tagName/articles', auth, async (c) => {
  const { articleId } = await c.req.json(); // assuming articleId is sent in body
  const tagName = c.req.param('tagName');
  const user = c.get('user');

  // Find the tag
  const tag = await prisma.tag.findUnique({ where: { name: tagName } });
  if (!tag) return c.json({ error: 'Tag not found' }, 404);

  // Optional: verify user owns the article or is admin
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return c.json({ error: 'Article not found' }, 404);
  if (article.userId !== user.id && !user.admin) return c.json({ error: 'Unauthorized' }, 403);

  // Link tag to article
  await prisma.articleTag.create({
    data: {
      articleId,
      tagId: tag.id,
    },
  });

  return c.json({ message: 'Tag added to article' }, 200);
});


export default tags;
