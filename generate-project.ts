'use server'

import { generateSiteStructure } from '@/lib/ai/gemini-generator';
import { WizardState } from '@/lib/types/wizard';
// import { db } from '@/lib/db'; // Assuming Prisma setup later

export async function createProjectAction(wizardState: WizardState) {
  console.log("⚡ MARZ: Initiating Sequence for", wizardState.businessName);

  // 1. Generate Content via Gemini
  const aiData = await generateSiteStructure(wizardState);

  // 2. Mock Database Save (Replace with Prisma create later)
  // const project = await db.project.create({ data: { name: wizardState.businessName, ... } })
  
  const projectId = `proj_${Date.now()}`;

  // 3. Store AI Data (In production, save `aiData` to a 'sites' table in the DB)
  
  return { success: true, projectId, aiData };
}