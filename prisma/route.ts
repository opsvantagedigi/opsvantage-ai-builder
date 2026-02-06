import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import slugify from 'slugify';

const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters long.'),
});

/**
 * POST /api/workspaces
 * Creates a new workspace for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null };
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 2. Validate the request body
    const body = await request.json();
    const validation = createWorkspaceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name } = validation.data;

    // 3. Generate a unique slug for the workspace
    let slug = slugify(name, { lower: true, strict: true });
    const existingWorkspace = await prisma.workspace.findUnique({ where: { slug } });
    if (existingWorkspace) {
      // If slug exists, append a short random string to ensure uniqueness
      slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // 4. Create the Workspace and WorkspaceMember in a single transaction
    const newWorkspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true, // Include the members in the response
      },
    });

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the workspace.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workspaces
 * Lists all workspaces for the authenticated user.
 */
export async function GET() {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null };
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 2. Query for all workspaces the user is a member of
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching workspaces.' }, { status: 500 });
  }
}