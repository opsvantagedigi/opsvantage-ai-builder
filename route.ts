import { NextResponse } from 'next/server';
import { db } from './db';
import type { Section, Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const { sectionId } = params;

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required.' }, { status: 400 });
    }

    const originalSection = (await db.section.findUnique({
      where: { id: sectionId },
    })) as Section | null;

    if (!originalSection) {
      return NextResponse.json({ error: 'Section not found.' }, { status: 404 });
    }

    // Create the new section first, with a temporary order
    const newSection = await db.section.create({
      data: {
        pageId: originalSection.pageId,
        type: originalSection.type,
        variant: originalSection.variant,
        data: (originalSection.data as unknown) as Prisma.InputJsonValue,
        order: ((originalSection as any).order ?? 0) + 1, // Temporary order
      },
    });

    // Get all sections for the page (excluding the new one) to calculate the new order
    const otherSections = await db.section.findMany({
        where: {
            pageId: originalSection.pageId,
            id: { not: newSection.id }
        },
        orderBy: { order: 'asc' }
    });

    const originalIndex = otherSections.findIndex(s => s.id === originalSection.id);
    
    // Create the final, correctly ordered array of all sections
    const finalOrder = [
        ...otherSections.slice(0, originalIndex + 1),
        newSection,
        ...otherSections.slice(originalIndex + 1),
    ];

    // Update the order of all sections in a single transaction
    const transactions = finalOrder.map((s: Section | any, index: number) =>
      db.section.update({ where: { id: (s as any).id }, data: { order: index } as any })
    );
    await db.$transaction(transactions as any);

    const finalNewSection = await db.section.findUnique({ where: { id: newSection.id } });
    return NextResponse.json(finalNewSection);
  } catch (error) {
    console.error('[DUPLICATE_SECTION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to duplicate section.' }, { status: 500 });
  }
}