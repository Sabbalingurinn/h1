import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth.js';
import cloudinary from '../cloudinary.js';
import type { AppContext } from '../context.js';

const prisma = new PrismaClient();
const articles = new Hono();

// Create new article with Cloudinary image upload
articles.post('/', auth, async (c: AppContext) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const articlename = body['articlename'] as string;
  const content = body['content'] as string;
  const categoryId = body['categoryId'] as string | undefined;
  const file = body['image'] as File;

  if (!articlename || !content || !file) {
    return c.json({ error: 'Article name, content, and image are required' }, 400);
  }

  try {
    // Proper file upload handling
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
    });

    const article = await prisma.article.create({
      data: {
        articlename,
        content,
        img: uploadResult.secure_url,
        userId: user.id,
        categoryId: categoryId ? Number(categoryId) : undefined,
      },
    });

    return c.json(article, 201);
  } catch (error) {
    return c.json({ error: 'Cloudinary upload failed', details: error }, 500);
  }
});

// Update article, optionally with a new image
articles.patch('/:articleId', auth, async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const body = await c.req.parseBody();
  const articlename = body['articlename'] as string | undefined;
  const content = body['content'] as string | undefined;
  const file = body['img'] as File | undefined;

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
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        resource_type: 'image',
      });

      cloudinaryUrl = uploadResult.secure_url;
    } catch (error) {
      return c.json({ error: 'Cloudinary upload failed', details: error }, 500);
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

export default articles;
