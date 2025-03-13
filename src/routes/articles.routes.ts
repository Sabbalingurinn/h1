import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth.js';

import cloudinary from '../cloudinary.js';

const prisma = new PrismaClient();
const articles = new Hono();

// Upload image to Cloudinary and create an article
articles.post('/', auth, async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody(); // Hono parses form-data here
  const { articlename, content, categoryId } = body;
  const file = body.image as File; // Extract uploaded file

  if (!articlename || !content) {
    return c.json({ error: 'Article name and content are required' }, 400);
  }

  if (!file) {
    return c.json({ error: 'Image file is required' }, 400);
  }

  try {
    // Convert file to buffer and upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.name);
    
    // Save article with Cloudinary URL
    const article = await prisma.article.create({
      data: {
        articlename,
        content,
        img: uploadResult.secure_url, // Store Cloudinary URL
        userId: user.id,
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    return c.json(article, 201);
  } catch (error) {
    return c.json({ error: 'Cloudinary upload failed' }, 500);
  }
});

// Update an article (including changing the image)
articles.patch('/:articleId', auth, async (c) => {
  const articleId = Number(c.req.param('articleId'));
  const user = c.get('user');
  const body = await c.req.parseBody();
  const { articlename, content } = body;
  const file = body.image as File;

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
      const uploadResult = await cloudinary.uploader.upload(file.name);
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

export default articles;