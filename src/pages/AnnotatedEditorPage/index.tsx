import AnnotatedTextEditor from "@/components/AnnotatedTextEditor";
import Layout from "@/components/Layout";
import { useState } from "react";

const AnnotatedEditorPage = () => {
  const [saveStatus, setSaveStatus] = useState<string>("");

  const handleSave = (success: boolean, documentId?: string) => {
    if (success) {
      setSaveStatus(
        `✅ Document saved successfully! ${documentId ? `ID: ${documentId}` : ""}`
      );
      setTimeout(() => setSaveStatus(""), 3000);
    } else {
      setSaveStatus("❌ Failed to save document");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleContentChange = () => {
    // You can add auto-save logic here if needed
    console.log("Content changed in editor");
  };

  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Annotated Text Editor
          </h1>
          <p className='text-gray-600'>
            Create documents with both text and drawings. Switch between text
            and drawing modes seamlessly.
          </p>

          {/* Save status notification */}
          {saveStatus && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                saveStatus.includes("✅")
                  ? "bg-green-100 border border-green-300 text-green-700"
                  : "bg-red-100 border border-red-300 text-red-700"
              }`}
            >
              {saveStatus}
            </div>
          )}
        </div>

        <div className='bg-white rounded-lg shadow-lg p-6'>
          <AnnotatedTextEditor
            userId='demo-user-123' // Replace with actual user ID from auth
            initialMode='text'
            onSave={handleSave}
            onContentChange={handleContentChange}
            className='min-h-screen'
          />
        </div>

        <div className='mt-8 bg-gray-50 rounded-lg p-6'>
          <h2 className='text-xl font-semibold mb-4'>How to use:</h2>
          <ul className='space-y-2 text-gray-700'>
            <li>
              • <strong>Text Mode:</strong> Write and format text using the rich
              text editor
            </li>
            <li>
              • <strong>Draw Mode:</strong> Create drawings and annotations over
              your text
            </li>
            <li>
              • <strong>Analyze:</strong> Capture screenshots of both text and
              drawing content and send for analysis
            </li>
            <li>
              • <strong>Quick Save:</strong> Save without title/description
              (appears when you have unsaved changes)
            </li>
            <li>
              • <strong>Save As:</strong> Save with a custom title and
              description
            </li>
            <li>
              • <strong>Clear All:</strong> Remove all content from both text
              and drawing layers
            </li>
          </ul>
        </div>

        <div className='mt-6 bg-blue-50 rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-2 text-blue-900'>
            Backend Integration
          </h3>
          <p className='text-blue-800'>
            This editor sends requests to your backend API endpoints:
          </p>
          <ul className='mt-2 space-y-1 text-blue-700'>
            <li>
              •{" "}
              <code className='bg-blue-200 px-2 py-1 rounded'>
                POST /documents
              </code>{" "}
              - Save new document
            </li>
            <li>
              •{" "}
              <code className='bg-blue-200 px-2 py-1 rounded'>
                GET /documents/:id
              </code>{" "}
              - Load document
            </li>
            <li>
              •{" "}
              <code className='bg-blue-200 px-2 py-1 rounded'>
                DELETE /documents/:id
              </code>{" "}
              - Delete document
            </li>
            <li>
              •{" "}
              <code className='bg-blue-200 px-2 py-1 rounded'>
                GET /users/:userId/documents
              </code>{" "}
              - Get user's documents
            </li>
            <li>
              •{" "}
              <code className='bg-blue-200 px-2 py-1 rounded'>
                POST /documents/analyze
              </code>{" "}
              - Analyze document screenshots
            </li>
          </ul>
        </div>

        <div className='mt-6 bg-purple-50 rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-2 text-purple-900'>
            Analysis Feature
          </h3>
          <p className='text-purple-800 mb-3'>
            The Analyze button captures screenshots of your content and sends
            them to your backend for analysis.
          </p>
          <div className='text-sm text-purple-700'>
            <p className='font-medium mb-2'>Screenshots captured:</p>
            <ul className='space-y-1 ml-4'>
              <li>
                • <strong>Text Canvas:</strong> Screenshot of the rich text
                editor content
              </li>
              <li>
                • <strong>Drawing Canvas:</strong> Screenshot of the
                drawing/annotation layer
              </li>
              <li>
                • <strong>Combined Canvas:</strong> Both layers merged into a
                single image
              </li>
            </ul>
            <p className='mt-3 text-xs bg-purple-100 p-2 rounded'>
              <strong>API Payload:</strong> Screenshots are sent as
              base64-encoded PNG images in the request body
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnnotatedEditorPage;
