import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Page, Project, Section } from '@prisma/client';
import ProjectClientPage from './components/ProjectClientPage';

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

// Define a more specific type for the project payload, including the new `order` field
type ProjectWithPagesAndSections = Project & {
  pages: (Page & {
    sections: (Section & { order: number | null })[];
  })[];
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await db.project.findUnique({
    where: { id: params.projectId },
    include: {
      pages: {
        orderBy: { isHome: 'desc' }, // Show home page first
        include: {
          sections: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <ProjectClientPage project={project as ProjectWithPagesAndSections} />
  );
}