declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    text: string;
    info: any;
    metadata: any;
    version: string;
  }
  function pdfParse(buffer: Buffer | Uint8Array): Promise<PDFData>;
  function pdfParse(buffer: Buffer | Uint8Array, options: any): Promise<PDFData>;
  export = pdfParse;
}