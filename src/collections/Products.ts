import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'asin', 'brand', 'price'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'asin',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Código ASIN de Amazon (p. ej. B0BXQVCZS2)',
      },
    },
    {
      name: 'brand',
      type: 'text',
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'Precio a mostrar (texto libre, p. ej. «49,99 €»). Edítalo manualmente.',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      admin: {
        step: 0.1,
        description: 'Valoración opcional de 0 a 5',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'features',
      type: 'textarea',
      admin: {
        description: 'Puntos clave, uno por línea',
      },
    },
  ],
}
