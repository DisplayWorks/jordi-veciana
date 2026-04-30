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
      name: 'coverImage1', title: 'Cover Image — Variant 1 (Sketch)',
      type: 'image', options: { hotspot: true },
    },
    {
      name: 'coverImage2', title: 'Cover Image — Variant 2 (Photo)',
      type: 'image', options: { hotspot: true },
    },
    {
      name: 'coverVariant', title: 'Cover Variant', type: 'number',
      description: 'Variant 1 = sketch image small, Variant 2 = photo fills half.',
      options: {
        list: [
          { title: 'Variant 1 — Sketch', value: 1 },
          { title: 'Variant 2 — Photo',  value: 2 },
        ],
        layout: 'radio',
      },
    },
  ],
}
