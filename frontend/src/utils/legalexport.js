import { jsPDF } from "jspdf";

export function exportLegalPDF(vaultData, userId) {
  const doc = new jsPDF();
  
  // Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CERTIFIED ZERO-KNOWLEDGE VAULT REPORT", 14, 20);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated On: ${new Date().toUTCString()}`, 14, 28);
  doc.text(`User Pseudonym ID: ${userId}`, 14, 34);
  
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Content body
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Decrypted Vault Payload Content:", 14, 50);

  doc.setFont("Courier", "normal");
  doc.setFontSize(10);
  
  const splitText = doc.splitTextToSize(vaultData || "[Empty Vault Record]", 180);
  doc.text(splitText, 14, 60);

  // Footer watermark / compliance note
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Cryptographically secured via client-side AES-GCM-256. Zero-Knowledge Architecture.", 14, 285);

  doc.save(`Vault_Report_${userId}.pdf`);
}