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

export default tags;
