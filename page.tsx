import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProjectClientPage from './components/ProjectClientPage';

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await db.project.findUnique({
    where: { id: params.projectId },
    include: {
      pages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sections: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <ProjectClientPage project={project as any} />
  );
}