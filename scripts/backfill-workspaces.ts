// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is set
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set in .env or environment");
}

/* 
 * NOTE: Using the same adapter initialization as src/lib/prisma.ts
 * Depending on the version, PrismaNeon might accept connectionString object or Pool.
 * We follow the existing codebase pattern.
 */
const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting backfill...");
  
  const users = await prisma.user.findMany({
    include: {
      workspaces: true
    }
  });

  for (const user of users) {
    if (user.workspaces.length > 0) {
      console.log(`User ${user.email} already has a workspace.`);
      // Check if existing projects are linked
      const projects = await prisma.project.findMany({ where: { ownerId: user.id } });
      const workspace = user.workspaces[0].workspaceId; // Just grab first one for simplicity
      for (const project of projects) {
        if (!project.workspaceId) {
             await prisma.project.update({
                where: { id: project.id },
                data: { workspaceId: workspace }
            });
            console.log(`Linked orphaned project ${project.name} to existing workspace.`);
        }
      }
      continue;
    }

    console.log(`Creating workspace for user ${user.id}...`);
    
    const workspaceName = `${user.name || 'User'}'s Workspace`;
    const safeName = (user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const workspaceSlug = `${safeName}-${user.id.slice(0, 4)}-${Date.now()}`; // Ensure uniqueness

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        }
      }
    });

    const projects = await prisma.project.findMany({
      where: { ownerId: user.id }
    });
    
    for (const project of projects) {
        if (!project.workspaceId) {
            await prisma.project.update({
                where: { id: project.id },
                data: { workspaceId: workspace.id }
            });
            console.log(`Moved project ${project.name} to workspace ${workspace.name}`);
        }
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
