import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth, adminOnly } from '../middleware/auth';

const prisma = new PrismaClient();
const articles = new Hono();

articles.get('/', async (c) => {
  const allArticles = await prisma.article.findMany();
  return c.json(allArticles);
});

articles.get('/users/:userId/articles', async (c) => {
  const userId = Number(c.req.param('userId'));
  const userArticles = await prisma.article.findMany({ where: { userId } });
  return c.json(userArticles);
});

articles.get('/:articleId', async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  return article ? c.json(article) : c.notFound();
});

articles.post('/', auth, async (c) => {
  const data = await c.req.json();
  const user = c.get('user');
  const article = await prisma.article.create({
    data: { ...data, userId: user.id },
  });
  return c.json(article);
});

articles.patch('/:articleId', auth, async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });

  if (existingArticle?.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const data = await c.req.json();
  const updatedArticle = await prisma.article.update({ where: { id: articleId }, data });
  return c.json(updatedArticle);
});

articles.delete('/:articleId', auth, async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });

  if (existingArticle?.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await prisma.article.delete({ where: { id: articleId } });
  return c.json({ message: 'Article deleted successfully' });
});

export default articles;
