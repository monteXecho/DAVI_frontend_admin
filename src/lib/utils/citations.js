/**
 * Utility functions for parsing citations from RAG answers
 * and filtering documents based on citation numbers.
 */

/**
 * Parse citation numbers from answer text (e.g., [1], [2], [3])
 * @param {string} answerText - The answer text containing citations
 * @returns {number[]} Array of citation indices (0-based)
 */
export function parseCitations(answerText) {
  if (!answerText) return []
  
  const citationRegex = /\[(\d+)\]/g
  const matches = []
  let match
  
  while ((match = citationRegex.exec(answerText)) !== null) {
    const citationNumber = parseInt(match[1], 10)
    // Convert to 0-based index (citation [1] = index 0, [2] = index 1, etc.)
    matches.push(citationNumber - 1)
  }
  
  // Remove duplicates and sort
  return [...new Set(matches)].sort((a, b) => a - b)
}

/**
 * Filter documents to only include those that are cited in the answer
 * @param {Array} documents - Array of document objects (already filtered by backend)
 * @param {string} answerText - The answer text containing citations
 * @returns {Array} Filtered array of documents
 */
export function filterDocumentsByCitations(documents, answerText) {
  if (!documents || documents.length === 0) return documents
  if (!answerText) return documents
  
  // Parse citation numbers from answer (e.g., [1], [2], [3])
  const citationRegex = /\[(\d+)\]/g
  const citationNumbers = []
  let match
  
  while ((match = citationRegex.exec(answerText)) !== null) {
    const citationNumber = parseInt(match[1], 10)
    citationNumbers.push(citationNumber)
  }
  
  // Remove duplicates and sort
  const uniqueCitationNumbers = [...new Set(citationNumbers)].sort((a, b) => a - b)
  
  // If no citations in answer, return empty - don't show unrelated resources
  if (uniqueCitationNumbers.length === 0) {
    return []
  }
  
  // The backend already filters documents, so citations [1], [2], etc. should map to
  // documents at indices 0, 1, etc. in the returned array
  // However, we need to handle the case where citations might be higher numbers
  // (e.g., [10], [11]) but the backend only returns a few documents
  
  // Strategy: Match citations to documents by index (citation [1] = index 0, [2] = index 1, etc.)
  // Document Chat backend returns only cited docs (e.g. answer has [5] but backend sends 1 doc at index 0)
  const citedDocuments = []
  const seenFileIds = new Set()

  for (const citationNum of uniqueCitationNumbers) {
    const docIndex = citationNum - 1 // Convert to 0-based index

    if (docIndex >= 0 && docIndex < documents.length) {
      const doc = documents[docIndex]
      const fileId = doc?.meta?.file_id || doc?.file_id
      if (!fileId || !seenFileIds.has(fileId)) {
        citedDocuments.push(doc)
        if (fileId) seenFileIds.add(fileId)
      }
    }
  }

  // Document Chat: backend returns only cited docs; citation [5] in answer maps to their index 0
  // If no docs matched (e.g. citation [5] but we have 1 doc), show all - backend already filtered
  if (citedDocuments.length === 0 && documents.length > 0) {
    return documents
  }
  return citedDocuments
}

