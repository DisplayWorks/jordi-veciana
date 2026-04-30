// @ts-nocheck
export default {
  name: 'settings', title: 'Settings', type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'inquiryEmail', title: 'Global Inquiry Email', type: 'string',
      description: 'Used as fallback when no project-specific email is set.',
    },
  ],
}
