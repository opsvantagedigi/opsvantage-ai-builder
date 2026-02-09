import { defineConfig } from "@prisma/internals/dist/cli/commandPlugins/defineConfig"

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})