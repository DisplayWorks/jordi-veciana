// @ts-nocheck
export default {
  name: 'settings', title: 'Settings', type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'inquiryEmail', title: 'Global Inquiry Email', type: 'string',
      description: 'Used as fallback when no project-specific email is set.',
    },
    {
      name: 'ogImage', title: 'Social Share Image (OG Image)',
      type: 'image', options: { hotspot: true },
      description: 'Shown when sharing on social media. 1200x630px empfohlen.',
    },
    {
      name: 'coverName', title: 'Cover — Name', type: 'string',
      description: 'Z.B. "Jordi Veciana"',
    },
    {
      name: 'coverSubtitle', title: 'Cover — Subtitle', type: 'string',
      description: 'Z.B. "Selected Works 2018 — 2026"',
    },
    {
      name: 'coverCategories', title: 'Cover — Categories', type: 'text', rows: 4,
      description: 'Eine Kategorie pro Zeile. Z.B. Architecture / Lighting / ...',
    },
  ],
}
