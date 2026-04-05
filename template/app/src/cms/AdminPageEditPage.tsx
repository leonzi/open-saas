import { type AuthUser } from 'wasp/auth'
import {
  useQuery,
  getPageById,
  createPage,
  updatePage,
} from 'wasp/client/operations'
import { useHistory, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DefaultLayout from '../admin/layout/DefaultLayout'
import { Button } from '../client/components/ui/button'
import { ArrowLeft, Bold, Italic, List, ListOrdered, Heading2, Heading3 } from 'lucide-react'

const isNew = (id: string) => id === 'new'

export default function AdminPageEditPage({ user }: { user: AuthUser }) {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()

  const { data: existing } = useQuery(getPageById, { id }, { enabled: !isNew(id) })

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (existing && editor) {
      setTitle(existing.title)
      setSlug(existing.slug)
      setIsPublished(existing.isPublished)
      editor.commands.setContent(existing.content)
    }
  }, [existing, editor])

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (isNew(id)) setSlug(autoSlug(value))
  }

  async function handleSave() {
    if (!title || !slug) return setError('Title and slug are required')
    setSaving(true)
    setError('')
    try {
      const content = editor?.getHTML() ?? ''
      if (isNew(id)) {
        await createPage({ title, slug, content, isPublished })
      } else {
        await updatePage({ id, title, slug, content, isPublished })
      }
      history.push('/admin/pages')
    } catch (e: any) {
      setError(e.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-6 flex items-center gap-3'>
          <Button variant='ghost' size='sm' onClick={() => history.push('/admin/pages')}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-2xl font-bold'>{isNew(id) ? 'New Page' : 'Edit Page'}</h1>
        </div>

        <div className='space-y-4'>
          {/* Title */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Title</label>
            <input
              className='w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder='Page title'
            />
          </div>

          {/* Slug */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Slug <span className='text-muted-foreground font-normal'>(URL: /p/your-slug)</span>
            </label>
            <input
              className='w-full rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              placeholder='your-slug'
            />
          </div>

          {/* Editor */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Content</label>
            <div className='overflow-hidden rounded-md border'>
              {/* Toolbar */}
              <div className='flex gap-1 border-b bg-muted/50 p-2'>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  active={editor?.isActive('bold')}
                  title='Bold'
                >
                  <Bold className='h-4 w-4' />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  active={editor?.isActive('italic')}
                  title='Italic'
                >
                  <Italic className='h-4 w-4' />
                </ToolbarButton>
                <div className='mx-1 w-px bg-border' />
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor?.isActive('heading', { level: 2 })}
                  title='Heading 2'
                >
                  <Heading2 className='h-4 w-4' />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  active={editor?.isActive('heading', { level: 3 })}
                  title='Heading 3'
                >
                  <Heading3 className='h-4 w-4' />
                </ToolbarButton>
                <div className='mx-1 w-px bg-border' />
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  active={editor?.isActive('bulletList')}
                  title='Bullet list'
                >
                  <List className='h-4 w-4' />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  active={editor?.isActive('orderedList')}
                  title='Ordered list'
                >
                  <ListOrdered className='h-4 w-4' />
                </ToolbarButton>
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Published */}
          <div className='flex items-center gap-3'>
            <input
              id='published'
              type='checkbox'
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className='h-4 w-4 rounded border'
            />
            <label htmlFor='published' className='text-sm font-medium'>
              Published (visible at /p/{slug || 'slug'})
            </label>
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <div className='flex gap-3'>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant='outline' onClick={() => history.push('/admin/pages')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 hover:bg-muted ${active ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
    >
      {children}
    </button>
  )
}
