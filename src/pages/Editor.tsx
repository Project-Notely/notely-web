import './editor.css'

import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig'

import { useState } from 'react'

export default () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
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

  const toLogout = () => {
    signOut(auth);
    navigate('/login');
  }

  return (
    <div>
      <button style={{
        position: 'absolute',
        top: 10,
        right: 10,
        padding: '10px 20px',
        borderRadius: '20px',
        backgroundColor: 'blue',
        color: 'white',
        cursor: 'pointer',
        border: 'none',
        fontSize: '16px',
      }} onClick={() => toLogout()}>
        Logout
      </button>
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
    </div>
  )
}
