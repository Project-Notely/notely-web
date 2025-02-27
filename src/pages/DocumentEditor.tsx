import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { getDocument, updateDocument } from '../services/documentService';
import { Document } from '../types/document';
import './editor.css';

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
  });

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const token = await getAccessTokenSilently();
        const doc = await getDocument(token, id);
        setDocument(doc);
        setTitle(doc.title);
        
        if (editor) {
          editor.commands.setContent(doc.content || '');
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [id, getAccessTokenSilently, editor]);

  // Debounced save function
  const debouncedSave = useCallback((content: string) => {
    const timeout = setTimeout(async () => {
      if (!id || !document) return;
      
      try {
        setIsSaving(true);
        const token = await getAccessTokenSilently();
        await updateDocument(token, id, { 
          title, 
          content 
        });
      } catch (error) {
        console.error('Error saving document:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [id, title, document, getAccessTokenSilently]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(editor?.getHTML() || '');
  };

  if (isLoading) {
    return <div>Loading document...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Document"
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            border: 'none', 
            outline: 'none',
            width: '100%'
          }}
        />
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          {isSaving ? 'Saving...' : 'Saved'}
        </div>
      </div>
      
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1rem' }}>
        <EditorContent editor={editor} />
      </div>
      
      <button
        onClick={() => navigate('/dashboard')}
        style={{ 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f5f5f5',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default DocumentEditor; 