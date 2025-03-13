import { Hono } from 'hono';
import usersRoutes from './routes/users.routes';
import articlesRoutes from './routes/articles.routes';
import categoriesRoutes from './routes/categories.routes';
import commentsRoutes from './routes/comments.routes';
import tagsRoutes from './routes/tags.routes';

const app = new Hono();

const routes = [
  {
    href: '/',
    methods: ['GET'],
  },
  {
    href: '/users',
    methods: ['GET', 'POST'],
  },
  {
    href: '/users/:userId',
    methods: ['GET', 'PATCH', 'DELETE'],
  },
  {
    href: '/articles',
    methods: ['GET', 'POST'],
  },
  {
    href: '/articles/:articleId',
    methods: ['GET', 'PATCH', 'DELETE'],
  },
  {
    href: '/categories',
    methods: ['GET', 'POST'],
  },
  {
    href: '/categories/:categoryId/articles',
    methods: ['GET'],
  },
  {
    href: '/categories/:categoryId',
    methods: ['PATCH'],
  },
  {
    href: '/comments/:articleId',
    methods: ['GET'],
  },
  {
    href: '/comments/users/:userId/comments',
    methods: ['GET'],
  },
  {
    href: '/comments',
    methods: ['POST'],
  },
  {
    href: '/comments/:commentId',
    methods: ['DELETE'],
  },
  {
    href: '/tags',
    methods: ['GET', 'POST'],
  },
  {
    href: '/tags/:tagName/articles',
    methods: ['GET'],
  },
];

app.get('/', (c) => c.json(routes));
app.route('/users', usersRoutes);
app.route('/articles', articlesRoutes);
app.route('/categories', categoriesRoutes);
app.route('/comments', commentsRoutes);
app.route('/tags', tagsRoutes);

export default app;