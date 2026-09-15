import type { Block } from 'payload'

export const KeyTakeaways: Block = {
  slug: 'keyTakeaways',
  interfaceName: 'KeyTakeawaysBlock',
  labels: {
    singular: 'Puntos clave',
    plural: 'Puntos clave',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Puntos clave',
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
