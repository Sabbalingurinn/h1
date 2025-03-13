import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth, adminOnly } from '../middleware/auth.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const prisma = new PrismaClient();
const articles = new Hono();
const upload = multer({ storage: multer.memoryStorage() });

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

articles.post('/', auth, upload.single('image'), async (c) => {
  const user = c.get('user');
  const { articlename, content, categoryId } = c.req.body;
  const file = c.req.file;

  if (!articlename || !content) {
    return c.json({ error: 'Article name and content are required' }, 400);
  }

  if (!file) {
    return c.json({ error: 'Image file is required' }, 400);
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(`data:image/png;base64,${file.buffer.toString('base64')}`);
    const article = await prisma.article.create({
      data: {
        articlename,
        content,
        img: uploadResult.secure_url,
        userId: user.id,
        categoryId: categoryId || null,
      },
    });
    return c.json(article, 201);
  } catch (error) {
    return c.json({ error: 'Cloudinary upload failed' }, 500);
  }
});

articles.patch('/:articleId', auth, upload.single('image'), async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const { articlename, content } = c.req.body;
  const file = c.req.file;

  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    return c.json({ error: 'Article not found' }, 404);
  }
  if (existingArticle.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  let cloudinaryUrl = existingArticle.img;
  if (file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(`data:image/png;base64,${file.buffer.toString('base64')}`);
      cloudinaryUrl = uploadResult.secure_url;
    } catch (error) {
      return c.json({ error: 'Cloudinary upload failed' }, 500);
    }
  }

  const updatedArticle = await prisma.article.update({
    where: { id: articleId },
    data: {
      articlename: articlename || existingArticle.articlename,
      content: content || existingArticle.content,
      img: cloudinaryUrl,
    },
  });

  return c.json(updatedArticle);
});

articles.delete('/:articleId', auth, async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });

  if (!existingArticle) {
    return c.json({ error: 'Article not found' }, 404);
  }
  if (existingArticle.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await prisma.article.delete({ where: { id: articleId } });
  return c.json({ message: 'Article deleted successfully' });
});

export default articles;
