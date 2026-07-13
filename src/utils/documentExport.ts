import jsPDF from "jspdf";

export function exportToPDF(title: string, content: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(26, 28, 30); // Charcoal Navy
  doc.text(`INCROUTE | ${title}`, margin, y);
  y += 6;

  // Visual separator line
  doc.setDrawColor(99, 102, 241); // Indigo theme line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Date stamp
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Draft Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, margin, y);
  y += 12;

  // Body content (Times New Roman for legal typography)
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(content, contentWidth);
  let pageNumber = 1;

  for (const line of lines) {
    if (y > pageHeight - margin - 15) {
      // Add footer for the current page before creating a new page
      addFooter(doc, pageNumber, pageWidth, pageHeight, margin);
      doc.addPage();
      pageNumber++;
      y = margin + 15;
    }
    doc.text(line, margin, y);
    y += 6;
  }

  // Add footer to the last page
  addFooter(doc, pageNumber, pageWidth, pageHeight, margin);

  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_draft.pdf`;
  doc.save(filename);
}

function addFooter(doc: jsPDF, pageNumber: number, pageWidth: number, pageHeight: number, margin: number) {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  
  // Left aligned disclaimer
  doc.text(
    "Incroute common legal draft. Professional review recommended prior to statutory filings.",
    margin,
    pageHeight - 10
  );

  // Right aligned page numbering
  doc.setFont("helvetica", "normal");
  doc.text(`Page ${pageNumber}`, pageWidth - margin - 12, pageHeight - 10);
}

export function exportToDocx(title: string, content: string) {
  const formattedContent = content.replace(/\n/g, "<br>");
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.6;
        }
        p {
          margin: 0 0 10pt 0;
          text-align: justify;
        }
        h1, h2, h3 {
          font-family: Arial, sans-serif;
          color: #1a1c1e;
        }
      </style>
    </head>
    <body>
      <div style="font-family: 'Times New Roman', serif; font-size: 11pt;">
        ${formattedContent}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_draft.doc`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function printDocument(title: string, content: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formattedContent = content.replace(/\n/g, "<br>");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print - ${title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 2cm;
            color: #000;
          }
          pre {
            white-space: pre-wrap;
            font-family: 'Times New Roman', Times, serif;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; padding: 10px; background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: Arial, sans-serif; font-size: 10pt; font-weight: bold; color: #475569;">INCROUTE LEGAL DRAFT</span>
          <button onclick="window.print();" style="padding: 6px 12px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 9pt;">Print Document</button>
        </div>
        <div>
          ${formattedContent}
        </div>
        <script>
          window.onload = function() {
            // Auto trigger print in a short timeout
            setTimeout(function() { window.print(); }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function copyToClipboard(content: string): Promise<boolean> {
  return navigator.clipboard.writeText(content)
    .then(() => true)
    .catch(() => false);
}
