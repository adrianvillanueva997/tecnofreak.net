import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

export const testPost = {
  slug: 'edit-post-quick-action-test',
  title: 'Edit Post Quick Action Test',
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}

export async function seedTestPost(): Promise<number> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'posts',
    where: { slug: { equals: testPost.slug } },
    overrideAccess: true,
  })

  const post = await payload.create({
    collection: 'posts',
    data: {
      ...testPost,
      _status: 'published',
      content: {
        root: {
          type: 'root',
          direction: null,
          format: '',
          indent: 0,
          children: [
            {
              type: 'paragraph',
              direction: null,
              format: '',
              indent: 0,
              children: [
                {
                  type: 'text',
                  text: 'Test post content.',
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      },
    },
    draft: false,
    overrideAccess: true,
  })

  return post.id
}

export async function cleanupTestPost(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'posts',
    where: { slug: { equals: testPost.slug } },
    overrideAccess: true,
  })
}
