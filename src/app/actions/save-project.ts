'use server'

import { verifySession } from '@/lib/verify-session';
import { db } from '@/db';

/**
 * 🧠 MEMORY ENGRAM: Persists the entire site structure to the database
 * Called on auto-save debounce (1-2s after user stops editing)
 */
export async function saveProjectContentAction(projectId: string, content: any) {
  try {
    // 1. AUTH CHECK
    const session = await verifySession();
    if (!session?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. UPDATE DATABASE
    await db.project.update({
      where: { id: projectId },
      data: {
        content: content,
        updatedAt: new Date(),
      },
    });
    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('[MARZ] Memory Write Failed:', error);
    return { success: false, error: 'Failed to save project' };
  }
}

/**
 * 📖 MEMORY RECALL: Loads the full site structure from the database
 */
export async function loadProjectContentAction(projectId: string) {
  try {
    // 1. AUTH CHECK
    const session = await verifySession();
    if (!session?.email) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. LOAD FROM DATABASE
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { content: true, updatedAt: true },
    });

    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    return {
      success: true,
      content: project.content,
      lastSaved: project.updatedAt,
    };
  } catch (error) {
    console.error('[MARZ] Memory Recall Failed:', error);
    return { success: false, error: 'Failed to load project' };
  }
}
