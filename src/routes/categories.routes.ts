import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

import { auth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const categories = new Hono();

categories.get('/', async (c) => {
  const allCategories = await prisma.category.findMany();
  return c.json(allCategories);
});

categories.get('/:categoryId/articles', async (c) => {
  const categoryId = Number(c.req.param('categoryId'));
  const articles = await prisma.article.findMany({ where: { categoryId } });
  return c.json(articles);
});

categories.post('/', auth, async (c) => {
  const data = await c.req.json();
  const category = await prisma.category.create({ data });
  return c.json(category);
});

categories.patch('/:categoryId', auth, async (c) => {
  const categoryId = Number(c.req.param('categoryId'));
  const data = await c.req.json();
  const updatedCategory = await prisma.category.update({ where: { id: categoryId }, data });
  return c.json(updatedCategory);
});

export default categories;
