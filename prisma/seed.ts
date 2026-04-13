import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const password = await hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@focusboard.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@focusboard.com',
      password,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample tasks
  const tasks = [
    { title: 'Design new landing page', description: 'Create wireframes and high-fidelity mockups for the product landing page', priority: 'high', status: 'in_progress', tags: 'design,ui', dueDate: new Date(Date.now() + 2 * 86400000), order: 1 },
    { title: 'Write API documentation', description: 'Document all REST endpoints with examples and response schemas', priority: 'medium', status: 'todo', tags: 'docs,api', dueDate: new Date(Date.now() + 5 * 86400000), order: 2 },
    { title: 'Fix authentication bug', description: 'Users are being logged out unexpectedly after 10 minutes', priority: 'urgent', status: 'todo', tags: 'bug,auth', dueDate: new Date(), order: 3 },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', priority: 'medium', status: 'done', tags: 'devops', dueDate: new Date(Date.now() - 86400000), order: 4 },
    { title: 'Review pull requests', description: 'Review and merge pending PRs for the sprint', priority: 'high', status: 'todo', tags: 'review', dueDate: new Date(Date.now() + 86400000), order: 5 },
    { title: 'Update dependencies', description: 'Update npm packages to latest versions and fix vulnerabilities', priority: 'low', status: 'done', tags: 'maintenance', dueDate: new Date(Date.now() - 2 * 86400000), order: 6 },
    { title: 'Implement search feature', description: 'Add full-text search with filters and sorting', priority: 'high', status: 'in_progress', tags: 'feature,backend', dueDate: new Date(Date.now() + 3 * 86400000), order: 7 },
    { title: 'Prepare sprint demo', description: 'Create presentation slides for the sprint review meeting', priority: 'medium', status: 'todo', tags: 'meeting', dueDate: new Date(Date.now() + 4 * 86400000), order: 8 },
    { title: 'Optimize database queries', description: 'Profile and optimize slow queries in the dashboard endpoint', priority: 'high', status: 'todo', tags: 'performance,backend', dueDate: new Date(Date.now() + 6 * 86400000), order: 9 },
    { title: 'Write unit tests for auth', description: 'Increase test coverage for authentication module to 90%', priority: 'medium', status: 'done', tags: 'testing', dueDate: new Date(Date.now() - 3 * 86400000), order: 10 },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: user.id } });
  }

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create sample focus sessions
  const now = new Date();
  const sessionDurations = [25, 25, 15, 25, 25, 25, 50, 25, 30, 25];

  for (let i = 0; i < sessionDurations.length; i++) {
    const daysAgo = Math.floor(i / 3);
    const startedAt = new Date(now);
    startedAt.setDate(startedAt.getDate() - daysAgo);
    startedAt.setHours(9 + i * 2, 0, 0, 0);

    await prisma.focusSession.create({
      data: {
        duration: sessionDurations[i],
        type: 'focus',
        completed: true,
        startedAt,
        completedAt: new Date(startedAt.getTime() + sessionDurations[i] * 60000),
        userId: user.id,
      },
    });
  }

  console.log(`✅ Created ${sessionDurations.length} focus sessions`);

  // Create sample notes
  const notes = [
    { content: '## Sprint Goals\n\n- Complete the landing page redesign\n- Fix critical auth bug\n- Deploy v2.0 to staging\n\nReach out to design team for final review.' },
    { content: '## Architecture Notes\n\nWe decided to use:\n- Next.js App Router for frontend\n- Prisma for ORM\n- PostgreSQL for database\n- NextAuth for authentication\n\nKey consideration: Keep API routes stateless.' },
    { content: '## Meeting Notes - Product Review\n\nAction items:\n1. Improve mobile responsiveness\n2. Add dark mode toggle\n3. Implement notification system\n4. Create onboarding flow' },
    { content: '## Performance Optimization Ideas\n\n- Implement connection pooling\n- Add Redis cache for frequent queries\n- Use streaming for large datasets\n- Optimize images with next/image\n- Enable gzip compression' },
  ];

  for (let i = 0; i < notes.length; i++) {
    const linkedTask = i === 0 ? await prisma.task.findFirst({ where: { userId: user.id, title: 'Design new landing page' } }) : null;
    const noteData: any = {
      content: notes[i].content,
      userId: user.id,
    };
    if (linkedTask) noteData.taskId = linkedTask.id;
    await prisma.note.create({ data: noteData });
  }

  console.log(`✅ Created ${notes.length} notes`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@focusboard.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });