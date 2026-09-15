import type { Block, TextFieldSingleValidation } from 'payload'

export const Quote: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: {
    singular: 'Cita',
    plural: 'Citas',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      label: 'Cita',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
      label: 'Autor o fuente',
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'URL de la fuente',
      validate: ((value) => {
        if (!value) return true
        try {
          return ['http:', 'https:'].includes(new URL(value).protocol)
            ? true
            : 'La URL debe comenzar por http:// o https://.'
        } catch {
          return 'Introduce una URL válida.'
        }
      }) as TextFieldSingleValidation,
    },
  ],
}
