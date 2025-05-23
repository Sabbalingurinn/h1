import { Hono } from 'hono';
import { cors } from 'hono/cors';

import usersRoutes from './users.routes.js';
import articlesRoutes from './articles.routes.js';
import categoriesRoutes from './categories.routes.js';
import commentsRoutes from './comments.routes.js';
import tagsRoutes from './tags.routes.js';
import authRoutes from './auth.routes.js';

const app = new Hono();

app.use('/*', cors({ origin: '*' }));

const routes = [
  { href: '/', methods: ['GET'] },
  { href: '/auth/login', methods: ['POST'] },
  { href: '/auth/register', methods: ['POST'] }, 
  { href: '/users', methods: ['GET', 'POST'] },
  { href: '/users/:userId', methods: ['GET', 'PATCH', 'DELETE'] },
  { href: '/users/:userId/articles', methods: ['GET'] },
  { href: '/articles', methods: ['GET', 'POST'] },
  { href: '/articles/:articleId', methods: ['GET', 'PATCH', 'DELETE'] },
  { href: '/categories', methods: ['GET', 'POST'] },
  { href: '/categories/:categoryId/articles', methods: ['GET'] },
  { href: '/categories/:categoryId', methods: ['PATCH'] },
  { href: '/comments/:articleId', methods: ['GET'] },
  { href: '/comments/users/:userId/comments', methods: ['GET'] },
  { href: '/comments', methods: ['POST'] },
  { href: '/comments/:commentId', methods: ['DELETE'] },
  { href: '/tags', methods: ['GET', 'POST'] },
  { href: '/tags/:tagName/articles', methods: ['GET','POST'] },

];

app.get('/', (c) => c.json(routes));

app.route('/auth', authRoutes);
app.route('/users', usersRoutes);
app.route('/articles', articlesRoutes);
app.route('/categories', categoriesRoutes);
app.route('/comments', commentsRoutes);
app.route('/tags', tagsRoutes);

export default app;
