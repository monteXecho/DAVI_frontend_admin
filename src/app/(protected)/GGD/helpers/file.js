const getKeyFromFileName = (fileName) => {
  return fileName && fileName.length > 8 ? fileName.substr(0, 8) : null;
};

function getExtFromString(s) {
  try {
    const url = new URL(s);
    s = url.pathname; 
  } catch {
  }

  const match = s
    .toLowerCase()
    .match(/(\.tar\.(?:gz|bz2|xz))$|(\.[a-z0-9]+)$/i);
  if (!match) return "";
  return match[1] || match[2] || "";
}

function isFormatNeedFile(file) {
  const extList = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
  ];
  const ext = getExtFromString(file);
  return extList.includes(ext);
}

export { getKeyFromFileName, getExtFromString, isFormatNeedFile };
