import { expect, type Page, test } from '@playwright/test'
import { login } from '../helpers/login'
import {
  cleanupTestPost,
  cleanupTestUser,
  seedTestPost,
  seedTestUser,
  testPost,
  testUser,
} from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page
  let postID: number

  test.beforeAll(async ({ browser }, _testInfo) => {
    await seedTestUser()
    postID = await seedTestPost()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestPost()
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: /welcome to your dashboard/i })).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users(?:\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test("shows the current post's editor link", async () => {
    await page.goto(`/${testPost.slug}`)

    await expect(page.getByRole('link', { name: 'Edit Post' })).toHaveAttribute(
      'href',
      new URL(`/admin/collections/posts/${postID}`, page.url()).toString(),
    )
  })
})
