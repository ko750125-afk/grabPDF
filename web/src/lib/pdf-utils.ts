import { PDFDocument } from 'pdf-lib';

/**
 * Extracts specific pages from a PDF file.
 * @param file The source PDF file.
 * @param pageRange String like "1, 3, 5-7"
 */
export async function extractPdfPages(file: File, pageRange: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  const totalPages = srcDoc.getPageCount();
  const pagesToExtract: number[] = [];

  // Parse page range
  const parts = pageRange.split(',').map(p => p.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        if (i > 0 && i <= totalPages) pagesToExtract.push(i - 1);
      }
    } else {
      const pageNum = Number(part);
      if (pageNum > 0 && pageNum <= totalPages) pagesToExtract.push(pageNum - 1);
    }
  }

  // Deduplicate and sort
  const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);
  
  if (uniquePages.length === 0) throw new Error("유효한 페이지 범위가 아닙니다.");

  const copiedPages = await newDoc.copyPages(srcDoc, uniquePages);
  copiedPages.forEach(page => newDoc.addPage(page));

  return await newDoc.save();
}

/**
 * Merges multiple PDF files into one.
 * @param files Array of PDF files.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => mergedDoc.addPage(page));
  }

  return await mergedDoc.save();
}

export function downloadBlob(data: Uint8Array, fileName: string) {
  const blob = new Blob([data as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
