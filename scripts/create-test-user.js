// Usage: node scripts/create-test-user.js email
// This script creates a user + workspace + project directly via Prisma.
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const { neonConfig } = require('@neondatabase/serverless')
const ws = require('ws')
neonConfig.webSocketConstructor = ws

async function main(){
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/create-test-user.js email')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment')
    process.exit(2)
  }

  const adapter = new PrismaNeon({ connectionString })
  const prisma = new PrismaClient({ adapter })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log('User already exists:', existing.id)
      process.exit(0)
    }

    const user = await prisma.user.create({ data: { email, name: email.split('@')[0] } })
    const workspace = await prisma.workspace.create({ data: { name: `${user.name}'s Workspace`, slug: `ws-${Date.now()}`, ownerId: user.id } })
    await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' } })
    await prisma.project.create({ data: { name: 'Default Project', workspaceId: workspace.id } })

    console.log('Created user:', user.id)
  } catch (err) {
    console.error('Error creating test user', err)
    process.exit(2)
  } finally {
    await prisma.$disconnect()
  }
}

main()
