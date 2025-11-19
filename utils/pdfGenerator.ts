import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Finding, INSPECTOR_NAME, LOCATION_NAME } from '../types';

export const generatePDF = (findings: Finding[]) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('sk-SK');
  const fileDateStr = new Date().toISOString().split('T')[0];
  
  // --- Header ---
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102); // Dark blue
  doc.text('BOZP / OP / 5S - Inšpekčný Záznam', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  // Info Block
  const infoStartY = 30;
  doc.text(`Miesto kontroly: ${LOCATION_NAME}`, 14, infoStartY);
  doc.text(`Dátum kontroly: ${dateStr}`, 14, infoStartY + 6);
  doc.text(`Kontrolór: ${INSPECTOR_NAME}`, 14, infoStartY + 12);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, infoStartY + 16, 196, infoStartY + 16);

  // --- Findings Table ---
  const tableData = findings.map((f, index) => [
    index + 1,
    `${f.columnId} - ${f.columnName}`,
    `${f.rowId}. ${f.rowName}`,
    f.comment || 'Bez komentára'
  ]);

  autoTable(doc, {
    startY: infoStartY + 20,
    head: [['#', 'Kontrolná položka', 'Zlyhanie', 'Popis zlyhania']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [255, 215, 0], textColor: [0, 0, 0], fontStyle: 'bold' }, // Yellow header
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' },
    },
  });

  // --- Images ---
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Fotodokumentácia', 14, finalY);
  finalY += 10;

  let xOffset = 14;
  const imgWidth = 50;
  const imgHeight = 50;
  const pageHeight = doc.internal.pageSize.height;

  findings.forEach((f, fIndex) => {
    if (f.images.length > 0) {
      // Check if we need a new page for the title
      if (finalY + 10 > pageHeight) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Položka ${fIndex + 1}: ${f.columnName} - ${f.rowName}`, 14, finalY);
      finalY += 8;
      doc.setFont('helvetica', 'normal');

      // Reset X for new row of images
      xOffset = 14;

      f.images.forEach((imgData) => {
        // Check vertical space for image
        if (finalY + imgHeight > pageHeight) {
          doc.addPage();
          finalY = 20;
          xOffset = 14;
        }

        try {
            doc.addImage(imgData, 'JPEG', xOffset, finalY, imgWidth, imgHeight);
            xOffset += imgWidth + 5;
        } catch (e) {
            console.error("Error adding image to PDF", e);
        }
      });
      
      finalY += imgHeight + 10; // Move down for next finding
    }
  });

  // --- Save ---
  doc.save(`_ BOZP_OP_5S_Inspecny zaznam _ ${fileDateStr}.pdf`);
};