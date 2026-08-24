import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const lists = await prisma.list.count();
  const tasks = await prisma.task.count();
  const subtasks = await prisma.subTask.count();

  console.log('Lists:', lists);
  console.log('Tasks:', tasks);
  console.log('SubTasks:', subtasks);

  if (tasks === 0) {
    console.log('\n⚠️  No tasks found!');
    const list = await prisma.list.findFirst();
    if (list) {
      console.log('But there IS a list:', list.id);
    }
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await prisma.$disconnect();
}
