import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@balti.app' },
    update: {},
    create: {
      email: 'test@balti.app',
      name: 'Test User',
      lists: {
        create: [
          {
            name: 'Project Balti',
            icon: '🚀',
            isPinned: true,
            accentColor: '#3b82f6',
            items: {
              create: [
                { title: 'Build QuickCapture UI', position: 1 },
                { title: 'Wire up Server Actions', position: 2 },
              ]
            }
          },
          {
            name: 'Groceries',
            icon: '🛒',
            items: {
              create: [
                { title: 'Coffee beans', position: 1 },
                { title: 'Oat milk', position: 2 },
              ]
            }
          }
        ]
      }
    }
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })