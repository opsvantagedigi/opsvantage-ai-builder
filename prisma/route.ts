import { NextResponse } from 'next/server';
import { db } from '../db';

/**
 * NOTE: This API route assumes you have added an `order` field to your `Section` model
 * and run `npx prisma db push` as described in the instructions.
 */

export async function POST(request: Request) {
  try {
    const { sectionIds } = await request.json();

    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return NextResponse.json({ error: 'Invalid sectionIds provided.' }, { status: 400 });
    }

    // Use a transaction to update all sections in one go
    const transactions = sectionIds.map((id, index) =>
      db.section.update({
        where: { id },
        data: { order: index },
      })
    );

    await db.$transaction(transactions);

    return NextResponse.json({ success: true, message: 'Section order updated.' });
  } catch (error) {
    console.error('[REORDER_SECTIONS_ERROR]', error);
    return NextResponse.json({ error: 'Failed to reorder sections.' }, { status: 500 });
  }
}