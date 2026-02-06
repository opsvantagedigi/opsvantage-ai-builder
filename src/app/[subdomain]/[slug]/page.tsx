import { createSanityClient } from "@/lib/sanity"
import { prisma } from "@/lib/prisma"

export default async function DynamicPage({ params }: { params: { subdomain: string; slug: string } }) {
  const { subdomain, slug } = params

  // 1. Find the project by subdomain
  const project = await prisma.project.findUnique({
    where: { subdomain }
  })

  if (!project || !project.sanityDataset) {
    return <div>Site not found</div>
  }

  // 2. Fetch page content from Sanity
  const sanity = createSanityClient(project.sanityDataset)

  const page = (await sanity.fetch(
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug }
  )) as { sections?: Array<Record<string, unknown>> } | null

  if (!page) {
    return <div>Page not found</div>
  }

  // 3. Render sections
  return (
    <div>
      {page.sections?.map((section, index) => {
        const _type = section._type as string | undefined
        switch (_type) {
          case "heroSection": {
            const headline = section.headline as string | undefined
            const subheadline = section.subheadline as string | undefined
            return (
              <div key={index} className="p-20 text-center bg-gray-100">
                <h1 className="text-4xl font-bold">{headline}</h1>
                <p className="mt-4 text-lg">{subheadline}</p>
              </div>
            )
          }

          default:
            return (
              <div key={index} className="p-10">
                Unknown section type: {_type}
              </div>
            )
        }
      })}
    </div>
  )
}
