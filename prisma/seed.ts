import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'HTML', description: 'HyperText Markup Language' },
      { name: 'CSS', description: 'Cascading Style Sheets' },
      { name: 'JavaScript', description: 'Programming language for the web' },
    ],
  });

  console.log('Created categories');

  // Seed Users
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedpassword', // Replace with actual hashed password
      admin: true,
    },
  });

  console.log('Created user:', user.username);

  // Seed Articles
  const article = await prisma.article.create({
    data: {
      articlename: 'Introduction to HTML',
      content: 'HTML is the standard markup language for documents...',
      img: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      userId: user.id,
      categoryId: 1,
    },
  });

  console.log('Created article:', article.articlename);

  // Seed Comments
  await prisma.comment.create({
    data: {
      content: 'Great introduction to HTML!',
      userId: user.id,
      articleId: article.id,
    },
  });

  console.log('Created comment');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
