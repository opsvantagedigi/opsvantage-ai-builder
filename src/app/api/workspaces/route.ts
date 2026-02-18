import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/verify-session';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export async function GET() {
  const session = await verifySession();
  if (!session?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const user = await prisma.user.findFirst({ where: { email: session.email, deletedAt: null } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      },
    },
  });

  const payload = memberships.map((membership) => ({
    id: membership.workspace.id,
    name: membership.workspace.name,
    slug: membership.workspace.slug,
    _count: membership.workspace._count,
  }));

  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session?.email) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Workspace name must be 2 to 80 characters.' }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email: session.email },
    update: {},
    create: {
      email: session.email,
      name: session.email.split('@')[0],
    },
  });

  const slugBase = slugify(name) || 'workspace';
  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: `${slugBase}-${Date.now()}`,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  return NextResponse.json(
    {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    },
    { status: 201 },
  );
}
