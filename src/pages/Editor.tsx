import './editor.css'

import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { useState } from 'react'

export default () => {
  const [isEditing, setIsEditing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
    ],
    content: `
    <p>
      hawwo
    </p>
    `,
  })

  return (
    <div style={{ position: 'relative', width: '80vw', height: '95vh', marginLeft: '20vw', marginTop: '5vh' }}>
      <EditorContent editor={editor} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        pointerEvents: isEditing ? 'auto' : 'none'
      }} />
    </div>
  )
}
