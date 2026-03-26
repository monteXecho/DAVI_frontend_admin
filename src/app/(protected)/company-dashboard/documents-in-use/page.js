import DocumentsInUseClient from './DocumentsInUseClient';

export default function DocumentsInUsePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <DocumentsInUseClient />
      </div>
    </div>
  );
}
