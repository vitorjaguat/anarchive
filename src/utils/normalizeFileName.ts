// thirdweb's upload pipeline doesn't reliably handle non-ASCII filenames —
// even a correctly NFC-normalized accented character (e.g. "câmara") can
// still produce an ipfs:// URI that 404s on every gateway, while the same
// file with accents stripped uploads and resolves fine. So rather than
// relying on Unicode normalization, replace any non-ASCII character with
// "_" before uploading (collapsing runs of "_" for readability).
export default function normalizeFileName(file: File): File {
  const lastDot = file.name.lastIndexOf('.');
  const base = lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
  const ext = lastDot > 0 ? file.name.slice(lastDot) : '';

  const asciiBase = base
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/_+/g, '_')
    .trim();
  const normalizedName = `${asciiBase}${ext}`;

  if (normalizedName === file.name) return file;
  return new File([file], normalizedName, {
    type: file.type,
    lastModified: file.lastModified,
  });
}
