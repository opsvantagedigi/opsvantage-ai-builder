import { type SchemaTypeDefinition } from 'sanity'
import { projectType } from './project'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType],
}

