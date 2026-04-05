import { HttpError } from 'wasp/server'
import {
  type GetPages,
  type GetPageBySlug,
  type GetPageById,
  type CreatePage,
  type UpdatePage,
  type DeletePage,
} from 'wasp/server/operations'
import { type Page } from 'wasp/entities'

function requireAdmin(context: any) {
  if (!context.user) throw new HttpError(401)
  if (!context.user.isAdmin) throw new HttpError(403, 'Admins only')
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const getPages: GetPages<void, Page[]> = async (_args, context) => {
  requireAdmin(context)
  return context.entities.Page.findMany({
    orderBy: { updatedAt: 'desc' },
  })
}

export const getPageById: GetPageById<{ id: string }, Page | null> = async (
  { id },
  context
) => {
  requireAdmin(context)
  return context.entities.Page.findUnique({ where: { id } })
}

export const getPageBySlug: GetPageBySlug<
  { slug: string },
  Page | null
> = async ({ slug }, context) => {
  return context.entities.Page.findFirst({
    where: { slug, isPublished: true },
  })
}

// ── Actions ───────────────────────────────────────────────────────────────────

type PageInput = { title: string; slug: string; content: string; isPublished: boolean }

export const createPage: CreatePage<PageInput, Page> = async (
  { title, slug, content, isPublished },
  context
) => {
  requireAdmin(context)
  return context.entities.Page.create({
    data: { title, slug, content, isPublished, authorId: context.user!.id },
  })
}

export const updatePage: UpdatePage<
  PageInput & { id: string },
  Page
> = async ({ id, title, slug, content, isPublished }, context) => {
  requireAdmin(context)
  return context.entities.Page.update({
    where: { id },
    data: { title, slug, content, isPublished },
  })
}

export const deletePage: DeletePage<{ id: string }, Page> = async (
  { id },
  context
) => {
  requireAdmin(context)
  return context.entities.Page.delete({ where: { id } })
}
