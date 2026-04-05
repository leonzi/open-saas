import { useQuery, getPageBySlug } from 'wasp/client/operations'
import { useParams } from 'react-router-dom'

export default function PublicPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: page, isLoading } = useQuery(getPageBySlug, { slug }, { enabled: !!slug })

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    )
  }

  if (!page) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>404</h1>
          <p className='text-muted-foreground mt-2'>Page not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-3xl px-6 py-16'>
      <h1 className='mb-8 text-4xl font-bold'>{page.title}</h1>
      <div
        className='prose dark:prose-invert max-w-none'
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}
