import { defineField, defineType } from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(100).warning('Short titles are usually better'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Project Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Generating', value: 'generating' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
        name: 'description',
        title: 'Description',
        type: 'text',
        validation: rule => rule.max(300)
    }),
     defineField({
      name: 'generatedContent',
      title: 'Generated Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The AI generated content for the landing page',
    } as any),
  ],
})
