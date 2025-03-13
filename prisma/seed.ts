import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function main() {
  console.log('Seeding database...');

  // ✅ Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      username: 'olafur',
      email: 'olafur@example.com',
      password: await bcrypt.hash('osk', BCRYPT_ROUNDS),
      admin: true,
    },
  });

  // ✅ Create 6 regular users
  const usersData = await Promise.all(
    ['jon', 'magnus', 'piggi', 'bob', 'niall', 'josh'].map(async (username) => ({
      username,
      email: `${username}@example.com`,
      password: await bcrypt.hash('password123', BCRYPT_ROUNDS),
    }))
  );
  await prisma.user.createMany({ data: usersData });

  // ✅ Fetch users
  const allUsers = await prisma.user.findMany();
  console.log('Users created:', allUsers.length);

  // ✅ Create categories
  await prisma.category.createMany({
    data: [
      { name: 'Icelandic' },
      { name: 'Celebrity' },
      { name: 'Sports' },
      { name: 'Trump' },
    ],
  });

  // ✅ Fetch categories
  const allCategories = await prisma.category.findMany();
  console.log('Categories created:', allCategories.length);

  // ✅ Create tags
  await prisma.tag.createMany({
    data: [{ name: 'hot' }, { name: 'trending' }, { name: 'unsafe' }],
  });

  // ✅ Fetch tags
  const allTags = await prisma.tag.findMany();
  console.log('Tags created:', allTags.length);

  // ✅ Create 10 articles assigned to random users
  const articlesData = Array.from({ length: 10 }).map((_, index) => ({
    articlename: `Article ${index + 1}`,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
    categoryId: allCategories[Math.floor(Math.random() * allCategories.length)].id,
  }));

  await prisma.article.createMany({ data: articlesData });

  // ✅ Fetch all articles
  const allArticles = await prisma.article.findMany();
  console.log('Articles created:', allArticles.length);

  // ✅ Create 2 comments per article
  for (const article of allArticles) {
    for (let i = 0; i < 2; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      await prisma.comment.create({
        data: {
          content: 'This is a comment.',
          articleId: article.id,
          userId: randomUser.id,
        },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
