import { useState, useRef } from "react";
import { X, Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function BulkImportModal({ onClose, onUpload, loading, result }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Alleen CSV en Excel bestanden zijn toegestaan.');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative w-[500px] bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Bulk Import Gebruikers</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {!result ? (
          <>
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-[#23BD92] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInputChange}
              />
              
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Sleep je bestand hierheen of klik om te uploaden
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Ondersteunde formaten: CSV, Excel (.xlsx, .xls)
              </p>
              <p className="text-xs text-gray-400">
                Het bestand moet alleen e-mailadressen bevatten, één per regel
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Ondersteunde formaten:
                - Één e-mail per cel (aanbevolen)
                - E-mails als kolomkoppen
                - Meerdere e-mails in één regel
              </p>  
            </div>

            {/* Selected File */}
            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Bestandsvereisten:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bestand moet alleen e-mailadressen bevatten</li>
                    <li>Één e-mailadres per regel</li>
                    <li>Kolomkoppen zijn optioneel</li>
                    <li>Namen worden automatisch gegenereerd van e-mailprefix</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Result Display */
          <div className={`p-6 rounded-lg border-2 ${
            result.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {result.success ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className={`text-lg font-semibold ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Upload Succesvol' : 'Upload Mislukt'}
                </p>
                {result.success && result.data?.summary && (
                  <p className="text-sm text-green-600">
                    {result.data.summary.successful} gebruikers toegevoegd
                  </p>
                )}
              </div>
            </div>

            {result.success && result.data?.summary && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-green-600">{result.data.summary.successful}</p>
                    <p className="text-gray-600">Succesvol</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-yellow-600">{result.data.summary.duplicates}</p>
                    <p className="text-gray-600">Duplicaten</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">{result.data.summary.failed}</p>
                    <p className="text-gray-600">Mislukt</p>
                  </div>
                </div>
              </div>
            )}

            {!result.success && (
              <p className="text-red-700">{result.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          {result ? 'Sluiten' : 'Annuleren'}
        </button>
        
        {!result && (
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-4 py-2 bg-[#23BD92] text-white rounded-lg hover:bg-[#1ea87e] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploaden...</span>
              </>
            ) : (
              <span>Uploaden</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}