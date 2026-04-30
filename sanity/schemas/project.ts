// @ts-nocheck
import { orderRankField } from '@sanity/orderable-document-list'

const linkField = (name: string, title: string) => ({
  name, title, type: 'object',
  fields: [
    { name: 'text',      title: 'Text',          type: 'string'  },
    { name: 'url',       title: 'URL (optional)', type: 'url'     },
    { name: 'showArrow', title: 'Show arrow →',   type: 'boolean' },
  ],
})

export default {
  name: 'project', title: 'Project', type: 'document',
  fields: [
    orderRankField({ type: 'project' }),
    { name: 'title', title: 'Title', type: 'string', validation: R => R.required() },
    { name: 'slug',  title: 'Slug',  type: 'slug', options: { source: 'title' }, validation: R => R.required() },
    {
      name: 'category', title: 'Category', type: 'string',
      options: { layout: 'radio', list: [
        { title: 'Architecture',    value: 'architecture'    },
        { title: 'Interior Design', value: 'interior-design' },
        { title: 'Lighting',        value: 'lighting'        },
        { title: 'Product',         value: 'product'         },
        { title: 'Editorial',       value: 'editorial'       },
        { title: 'Imprint',         value: 'imprint'         },
      ]},
      validation: R => R.required(),
    },
    {
      name: 'images', title: 'Images', type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
          { name: 'isMobileImage', title: 'Use on mobile ★', type: 'boolean' },
        ],
        preview: {
          select: { media: 'image', mobile: 'isMobileImage' },
          prepare: ({ media, mobile }) => ({ title: mobile ? '★ Mobile' : 'Image', media }),
        },
      }],
    },
    {
      name: 'description', title: 'Description', type: 'array',
      of: [{
        type: 'block',
        styles: [{ title: 'Normal', value: 'normal' }],
        lists: [],
        marks: {
          decorators: [],
          annotations: [
            { name: 'link', title: 'Link', type: 'object',
              fields: [{ name: 'href', title: 'URL', type: 'url' }] },
          ],
        },
      }],
    },
    // Architecture / Interior Design
    { ...linkField('client',      'Client'),       hidden: ({ document }) => !['architecture','interior-design'].includes(document?.category) },
    { ...linkField('location',    'Location'),     hidden: ({ document }) => !['architecture','interior-design'].includes(document?.category) },
    { name: 'year', title: 'Year', type: 'string', hidden: ({ document }) => ['editorial','imprint'].includes(document?.category) },
    { name: 'inquiry', title: 'Inquiry email', type: 'string', hidden: ({ document }) => ['editorial','imprint'].includes(document?.category) },
    { ...linkField('publication', 'Publication'),  hidden: ({ document }) => !['architecture','interior-design'].includes(document?.category) },
    { name: "noImageGap", title: "No gap between images", type: "boolean", description: "Exception: removes gap between images (e.g. Beam)." },
    // Lighting / Product
    { ...linkField('manufacturer','Manufacturer'), hidden: ({ document }) => !['lighting','product'].includes(document?.category) },
    { name: 'material', title: 'Material', type: 'string', hidden: ({ document }) => !['lighting','product'].includes(document?.category) },
    { name: 'technicalSheet', title: 'Technical Sheet (PDF)', type: 'file', options: { accept: '.pdf' }, hidden: ({ document }) => !['lighting','product'].includes(document?.category) },
    // Imprint meta fields
    { ...linkField('imprintPhotography',   'Photography'),    hidden: ({ document }) => document?.category !== 'imprint' },
    { ...linkField('imprintGraphicDesign', 'Graphic Design'), hidden: ({ document }) => document?.category !== 'imprint' },
    { ...linkField('imprintFonts',         'Fonts'),          hidden: ({ document }) => document?.category !== 'imprint' },
    { ...linkField('imprintPublishedBy',   'Published by'),   hidden: ({ document }) => document?.category !== 'imprint' },
    { name: 'imprintCopyright', title: 'Copyright', type: 'string', hidden: ({ document }) => document?.category !== 'imprint' },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'images.0.image' },
    prepare: (val: Record<string, any>) => ({ title: val.title, subtitle: val.subtitle, media: val.media }),
  },
}
