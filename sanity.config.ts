import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import project from './sanity/schemas/project'
import settings from './sanity/schemas/settings'

export default defineConfig({
  projectId: 'es4uabv5',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({ type: 'project', S, context }),
            S.divider(),
            S.listItem()
              .title('Settings')
              .child(
                S.document()
                  .schemaType('settings')
                  .documentId('global-settings')
              ),
          ]),
    }),
  ],
  schema: { types: [project, settings] },
})
