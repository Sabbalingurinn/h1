import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth.js';
import cloudinary from '../cloudinary.js';
import type { AppContext } from '../context.js';

const prisma = new PrismaClient();
const articles = new Hono();

// Get all articles
articles.get('/:articleId', async (c) => {
  const articleId = Number(c.req.param('articleId'));

  if (isNaN(articleId)) {
    return c.json({ error: 'Invalid article ID' }, 400);
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }

  return c.json(article);
});


// Get articles by user
articles.get('/users/:userId/articles', async (c) => {
  const userId = Number(c.req.param('userId'));
  const userArticles = await prisma.article.findMany({ where: { userId } });
  return c.json(userArticles);
});

// Get a specific article
articles.get('/', async (c) => {
  const allArticles = await prisma.article.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
  return c.json(allArticles);
});


// Delete article (only admin or owner)
articles.delete('/:articleId', auth, async (c: AppContext) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');

  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
  if (!existingArticle) return c.json({ error: 'Article not found' }, 404);

  if (existingArticle.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await prisma.article.delete({ where: { id: articleId } });
  return c.json({ message: 'Article deleted successfully' });
});

// Update article with optional image upload (only admin or owner)
articles.patch('/:articleId', auth, async (c: AppContext) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const body = await c.req.parseBody();
  const articlename = body['articlename'] as string | undefined;
  const content = body['content'] as string | undefined;
  const file = body['image'] as File | undefined;

  const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });

  if (!existingArticle) {
    return c.json({ error: 'Article not found' }, 404);
  }

  if (existingArticle.userId !== user.id && !user.admin) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  let cloudinaryUrl = existingArticle.img;

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
    });

    cloudinaryUrl = uploadResult.secure_url;
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

// Create new article with Cloudinary image upload
articles.post('/', auth, async (c: AppContext) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const articlename = body['articlename'] as string;
  const content = body['content'] as string;
  const categoryName = body['category'] as string | undefined;
  const file = body['image'] as File | undefined;

  if (!articlename || !content) {
    return c.json({ error: 'Article name and content are required' }, 400);
  }

  let imageUrl: string | undefined;
  if (file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        resource_type: 'image',
      });

      imageUrl = uploadResult.secure_url;
    } catch (err) {
      return c.json({ error: 'Image upload failed', details: err }, 500);
    }
  }

  let categoryId: number | undefined = undefined;
  if (categoryName) {
    const category = await prisma.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      return c.json({ error: `Category "${categoryName}" not found` }, 400);
    }

    categoryId = category.id;
  }

  const article = await prisma.article.create({
    data: {
      articlename,
      content,
      img: imageUrl,
      userId: user.id,
      categoryId,
    },
  });

  return c.json(article, 201);
});
