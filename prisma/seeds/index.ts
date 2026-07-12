import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding Study OS database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'alex@university.edu' },
    update: { role: 'ADMIN' },
    create: {
      email: 'alex@university.edu',
      password: hashedPassword,
      name: 'Alex Rivera',
      role: 'ADMIN',
      xp: 8420,
      level: 5,
      streak: 7,
    },
  });

  console.log(`✅ Created admin user: ${user.email}`);

  // Seed a regular student user
  const studentPass = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      email: 'student@university.edu',
      password: studentPass,
      name: 'Sam Student',
      role: 'USER',
      xp: 1200,
      level: 2,
      streak: 3,
    },
  });
  console.log(`✅ Created student user: student@university.edu`);

  // Seed subjects
  const cs = await prisma.subject.upsert({
    where: { id: 'sub-cs' },
    update: {},
    create: {
      id: 'sub-cs',
      name: 'Computer Science',
      category: 'STEM',
      mastery: 78,
      color: 'indigo',
      examDate: '2026-08-15',
      userId: user.id,
    },
  });

  const math = await prisma.subject.upsert({
    where: { id: 'sub-math' },
    update: {},
    create: {
      id: 'sub-math',
      name: 'Advanced Calculus',
      category: 'STEM',
      mastery: 65,
      color: 'violet',
      examDate: '2026-08-20',
      userId: user.id,
    },
  });

  console.log(`✅ Created ${2} subjects`);

  // Seed a note
  await prisma.note.upsert({
    where: { id: 'note-1' },
    update: {},
    create: {
      id: 'note-1',
      title: 'Binary Trees & AVL Rotation',
      content: '# Binary Search Trees\n\nA BST is a tree where every left child is smaller and right child is larger than the parent node.',
      folder: 'Computer Science',
      pinned: true,
      tags: ['EXAM', 'PRIORITY'],
      subjectId: cs.id,
      userId: user.id,
    },
  });

  console.log(`✅ Created sample note`);

  // Seed a flashcard deck
  const deck = await prisma.flashcardDeck.upsert({
    where: { id: 'deck-1' },
    update: {},
    create: {
      id: 'deck-1',
      name: 'Data Structures Core',
      description: 'Essential data structure concepts for algorithms exam',
      category: 'Computer Science',
      progress: 45,
      subjectId: cs.id,
      userId: user.id,
    },
  });

  await prisma.flashcard.createMany({
    skipDuplicates: true,
    data: [
      { id: 'card-1', question: 'What is the time complexity of binary search?', answer: 'O(log n)', deckId: deck.id },
      { id: 'card-2', question: 'Define a Hash Table', answer: 'A data structure that maps keys to values using a hash function for O(1) average lookups.', deckId: deck.id },
    ],
  });

  console.log(`✅ Created flashcard deck with 2 cards`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
