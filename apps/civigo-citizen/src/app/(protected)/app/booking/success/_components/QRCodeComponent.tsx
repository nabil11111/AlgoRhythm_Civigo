"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode-generator";

type QRCodeComponentProps = {
  referenceCode: string;
};

export default function QRCodeComponent({
  referenceCode,
}: QRCodeComponentProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrRef.current || !referenceCode) return;

    // Clear previous QR code
    qrRef.current.innerHTML = "";

    try {
      // Create QR code with reference code
      const qr = QRCode(0, "M"); // Type 0 (auto), Error correction level M
      qr.addData(`REF:${referenceCode}`);
      qr.make();

      // Create the QR code as a table
      const qrTable = qr.createTableTag(4, 0); // Cell size 4, margin 0

      // Apply styling to the table
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = qrTable;
      const table = tempDiv.querySelector("table");

      if (table) {
        table.style.margin = "0 auto";
        table.style.borderCollapse = "collapse";

        // Style the cells
        const cells = table.querySelectorAll("td");
        cells.forEach((cell) => {
          cell.style.padding = "0";
          cell.style.margin = "0";
          cell.style.border = "none";
        });
      }

      qrRef.current.appendChild(tempDiv);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Fallback display
      qrRef.current.innerHTML = `
        <div class="w-[100px] h-[100px] bg-gray-200 rounded grid place-items-center mx-auto">
          <span class="text-[10px] text-gray-500 text-center">QR Code<br/>Error</span>
        </div>
      `;
    }
  }, [referenceCode]);

  return (
    <div className="flex justify-center">
      <div ref={qrRef} className="qr-code-container" />
    </div>
  );
}
