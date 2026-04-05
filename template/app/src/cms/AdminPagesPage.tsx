import { type AuthUser } from 'wasp/auth'
import { useQuery, getPages, deletePage } from 'wasp/client/operations'
import { useHistory } from 'react-router-dom'
import DefaultLayout from '../admin/layout/DefaultLayout'
import { Button } from '../client/components/ui/button'
import { Trash2, Pencil, Plus, Globe, EyeOff } from 'lucide-react'

export default function AdminPagesPage({ user }: { user: AuthUser }) {
  const { data: pages, isLoading } = useQuery(getPages)
  const history = useHistory()

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete page "${title}"?`)) return
    await deletePage({ id })
  }

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Pages</h1>
          <Button onClick={() => history.push('/admin/pages/new')}>
            <Plus className='mr-2 h-4 w-4' />
            New Page
          </Button>
        </div>

        {isLoading && <p className='text-muted-foreground'>Loading...</p>}

        {!isLoading && (!pages || pages.length === 0) && (
          <div className='rounded-lg border border-dashed p-12 text-center'>
            <p className='text-muted-foreground'>No pages yet.</p>
            <Button
              className='mt-4'
              variant='outline'
              onClick={() => history.push('/admin/pages/new')}
            >
              Create your first page
            </Button>
          </div>
        )}

        {pages && pages.length > 0 && (
          <div className='divide-y rounded-lg border'>
            {pages.map((page) => (
              <div
                key={page.id}
                className='flex items-center justify-between px-4 py-3'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>{page.title}</span>
                    {page.isPublished ? (
                      <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700'>
                        <Globe className='h-3 w-3' /> Published
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500'>
                        <EyeOff className='h-3 w-3' /> Draft
                      </span>
                    )}
                  </div>
                  <p className='text-muted-foreground text-sm'>/p/{page.slug}</p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => history.push(`/admin/pages/${page.id}`)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-red-500 hover:text-red-600'
                    onClick={() => handleDelete(page.id, page.title)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}
