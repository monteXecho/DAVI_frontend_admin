const API_BASE_URL = "/ggd";

export const FileKind = {
  STAFF_PLANNING: "staff-planning",
  CHILD_PLANNING: "child-planning",
  CHILD_REGISTRATION: "child-registration",
  VGC_LIST: "fixed-faces",
};

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const errorMessage = text || `Request failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  } catch (error) {
    console.error("API Request failed:", error);
    alert(
      error.message.includes("Failed to fetch")
        ? "Network error: Unable to connect to server. Please check your internet connection."
        : `Error: ${error.message}`
    );
    throw error;
  }
}

export async function uploadFile(file, kind) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", kind);
  return request("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function uploadFiles(files, kind) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("document_type", kind);
  return request("/uploads", {
    method: "POST",
    body: formData,
  });
}

export async function getFileStatus(fileKey) {
  return request(`/documents/status?keys=${fileKey}`, {
    method: "GET",
  });
}

export async function getFirstImageOfDoc(doc_key) {
  return request(
    `/documents/first-image?doc_key=${encodeURIComponent(doc_key)}`,
    {
      method: "GET",
    }
  );
}

export function getFileDownloadUrl(filePath) {
  return `${API_BASE_URL}${filePath}`;
}

export function getFileViewUrl(fileKey) {
  return `${API_BASE_URL}/files/${encodeURIComponent(fileKey)}/view`;
}

export async function removeFile(fileKey) {
  return request(`/files/${encodeURIComponent(fileKey)}`, {
    method: "DELETE",
  });
}

export async function startCheck(body) {
  return request("/checks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getCheckProgress(checkId) {
  return request(`/checks/${encodeURIComponent(checkId)}`, {
    method: "GET",
  });
}

export async function getCheckIds() {
  return request(`/checks`, {
    method: "GET",
  });
}

export async function getCheckList() {
  return request(`/checks/list`, {
    method: "GET",
  });
}

export async function getModuleDocuments(module) {
  return request(`/requirements?modules=${encodeURIComponent(module)}`, {
    method: "GET",
  });
}
