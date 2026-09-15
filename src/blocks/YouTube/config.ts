import type { Block, TextFieldSingleValidation } from 'payload'
import { getYouTubeVideoId } from '@/utilities/getYouTubeVideoId'

export const YouTube: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  labels: {
    singular: 'Vídeo de YouTube',
    plural: 'Vídeos de YouTube',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'URL del vídeo',
      required: true,
      admin: {
        description: 'Acepta enlaces youtube.com/watch, youtu.be, /shorts/ y /embed/.',
      },
      validate: ((value) =>
        typeof value === 'string' && getYouTubeVideoId(value)
          ? true
          : 'Introduce una URL válida de YouTube.') as TextFieldSingleValidation,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título accesible',
      defaultValue: 'Vídeo de YouTube',
    },
  ],
}
