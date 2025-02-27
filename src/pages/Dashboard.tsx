import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserDocuments, createDocument } from '../services/documentService';
import { Document } from '../types/document';

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = await getAccessTokenSilently();
        const userDocs = await fetchUserDocuments(token);
        setDocuments(userDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [getAccessTokenSilently, user?.sub]);

  const handleCreateDocument = async () => {
    try {
      const token = await getAccessTokenSilently();
      const newDoc = await createDocument(token, { title: 'Untitled Document', content: '' });
      navigate(`/document/${newDoc._id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  if (isLoading) {
    return <div>Loading your documents...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Documents</h1>
        <button 
          onClick={handleCreateDocument}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p>You don't have any documents yet.</p>
          <button 
            onClick={handleCreateDocument}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Create your first document
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {documents.map(doc => (
            <Link 
              key={doc._id} 
              to={`/document/${doc._id}`}
              onMouseEnter={() => setHoveredId(doc._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'block',
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: 'white',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hoveredId === doc._id ? 'translateY(-2px)' : 'none',
                boxShadow: hoveredId === doc._id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <h3>{doc.title}</h3>
              <p style={{ color: '#666', fontSize: '0.8rem' }}>
                Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 