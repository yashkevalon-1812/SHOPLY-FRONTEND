import { useRef, useState } from 'react';
import { formatINR } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  QrCode,
  Loader2,
  Award,
} from 'lucide-react';

// State GST Code Mapping
const STATE_GST_CODES = {
  'JAMMU AND KASHMIR': '01',
  'HIMACHAL PRADESH': '02',
  'PUNJAB': '03',
  'CHANDIGARH': '04',
  'UTTARAKHAND': '05',
  'HARYANA': '06',
  'DELHI': '07',
  'RAJASTHAN': '08',
  'UTTAR PRADESH': '09',
  'BIHAR': '10',
  'SIKKIM': '11',
  'ARUNACHAL PRADESH': '12',
  'NAGALAND': '13',
  'MANIPUR': '14',
  'MIZORAM': '15',
  'TRIPURA': '16',
  'MEGHALAYA': '17',
  'ASSAM': '18',
  'WEST BENGAL': '19',
  'JHARKHAND': '20',
  'ODISHA': '21',
  'CHHATTISGARH': '22',
  'MADHYA PRADESH': '23',
  'GUJARAT': '24',
  'MAHARASHTRA': '27',
  'ANDHRA PRADESH': '28',
  'KARNATAKA': '29',
  'GOA': '30',
  'KERALA': '32',
  'TAMIL NADU': '33',
  'TELANGANA': '36',
};

const getStateCode = (stateName) => {
  if (!stateName) return '27';
  return STATE_GST_CODES[stateName.trim().toUpperCase()] || '27';
};

// Currency formatter for PDF vector fonts (Rs. prefix)
const formatPdfINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'Rs. 0.00';
  }
  return (
    'Rs. ' +
    Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

// Convert number to Indian Rupee Words
function numberToWords(num) {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const inWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100)
      return b[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? a[n % 10] + ' ' : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' Hundred ' +
        (n % 100 !== 0 ? inWords(n % 100) : '')
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        'Thousand ' +
        (n % 1000 !== 0 ? inWords(n % 1000) : '')
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        'Lakh ' +
        (n % 100000 !== 0 ? inWords(n % 100000) : '')
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      'Crore ' +
      (n % 10000000 !== 0 ? inWords(n % 10000000) : '')
    );
  };

  const intVal = Math.floor(num || 0);
  if (intVal === 0) return 'Zero Rupees Only';
  return 'Rupees ' + inWords(intVal).replace(/\s+/g, ' ').trim() + ' Only';
}

// Generate exact standard A4 (210mm x 297mm) vector Tax Invoice PDF using jsPDF + jspdf-autotable
function generateInvoicePdf(jsPDF, autoTable, order) {
  // ISO 216 standard A4 page dimensions: 210mm width x 297mm height
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const invoiceNo = `INV-${order._id ? order._id.slice(-8).toUpperCase() : '00000000'}`;
  const buyingDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

  const buyerState = order.shippingAddress?.state || 'Maharashtra';
  const buyerStateCode = getStateCode(buyerState);
  const isIntraState = buyerStateCode === '29'; // Supplier state is Karnataka (29)

  const calculatedItemsTotal =
    order.itemsPrice ||
    order.orderItems?.reduce(
      (acc, item) => acc + (item.price || 0) * (item.qty || 1),
      0
    ) ||
    order.totalPrice ||
    0;

  const discountAmount = order.discountAmount || 0;
  const netBeforeTax = Math.max(0, calculatedItemsTotal - discountAmount);
  const taxableValue = Math.round((netBeforeTax / 1.18) * 100) / 100;
  const totalGst = Math.round((netBeforeTax - taxableValue) * 100) / 100;
  const shippingPrice = order.shippingPrice || 0;
  const grandTotal = order.totalPrice || netBeforeTax + shippingPrice;

  // 1. Top Header Banner (spanning A4 page margins: 10mm to 200mm)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(10, 10, pageWidth - 20, 24, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SHOPLY', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('PREMIER LUXURY MARKETPLACE', 15, 28);

  // Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE / BILL OF SUPPLY', pageWidth - 15, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('(Issued under Rule 46 of the CGST Rules, 2017)', pageWidth - 15, 25, {
    align: 'right',
  });
  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.text('ORIGINAL FOR RECIPIENT  |  A4 FORMAT', pageWidth - 15, 30, {
    align: 'right',
  });

  // 2. Company Particulars (Left column)
  let y = 40;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Shoply Commerce Technologies Private Limited', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  y += 4;
  doc.text(
    'Reg. Office: Prestige Tech Cloud, Tower B, Electronic City, Bengaluru, KA - 560066',
    14,
    y
  );
  y += 4;
  doc.text(
    'GSTIN: 27AAACS1429B1Z8  |  CIN: U74999MH2026PTC392811  |  State: Karnataka (29)',
    14,
    y
  );
  y += 4;
  doc.text(
    'Contact: care@shoply.com  |  Toll-Free Helpline: 1800-246-8000',
    14,
    y
  );

  // 3. Invoice Metadata Box (Right column)
  const metaX = pageWidth - 80;
  const metaY = 37;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(metaX, metaY, 70, 27, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Invoice No:', metaX + 3, metaY + 5);
  doc.setTextColor(217, 119, 6);
  doc.text(invoiceNo, metaX + 67, metaY + 5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Invoice Date:', metaX + 3, metaY + 9.5);
  doc.text(invoiceDate, metaX + 67, metaY + 9.5, { align: 'right' });

  doc.text('Buying Date & Time:', metaX + 3, metaY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(buyingDateFormatted, metaX + 67, metaY + 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Order Ref ID:', metaX + 3, metaY + 18.5);
  doc.text('#' + (order._id || '').slice(-12), metaX + 67, metaY + 18.5, {
    align: 'right',
  });

  doc.text('Place of Supply:', metaX + 3, metaY + 23);
  doc.text(`${buyerState} (${buyerStateCode})`, metaX + 67, metaY + 23, {
    align: 'right',
  });

  // 4. Addresses Section (Supplier vs Buyer)
  const addrY = 67;
  const colW = (pageWidth - 20 - 4) / 2; // Width inside 10mm margins

  // Box 1: Supplier
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, addrY, colW, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SOLD BY / SUPPLIER:', 13, addrY + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Shoply Authorized Fulfillment Center Hub-4', 13, addrY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Electronic City Industrial Area, Phase 1', 13, addrY + 13.5);
  doc.text('Bengaluru, Karnataka - 560100, India', 13, addrY + 18);
  doc.text(
    'GSTIN: 27AAACS1429B1Z8  |  State: Karnataka (29)',
    13,
    addrY + 22.5
  );

  // Box 2: Buyer
  const buyerX = 10 + colW + 4;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(buyerX, addrY, colW, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO & SHIPPED TO (BUYER):', buyerX + 3, addrY + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(
    order.shippingAddress?.fullName || order.user?.name || 'Valued Customer',
    buyerX + 3,
    addrY + 9
  );
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    order.shippingAddress?.street || 'Customer Address',
    buyerX + 3,
    addrY + 13.5
  );
  doc.text(
    `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}`,
    buyerX + 3,
    addrY + 18
  );
  doc.text(
    `Phone: ${order.shippingAddress?.phone || 'N/A'}  |  State Code: ${buyerStateCode}`,
    buyerX + 3,
    addrY + 22.5
  );

  // 5. Itemized Table (calibrated for standard A4 margins: 10mm left & right)
  const tableData = (order.orderItems || []).map((item, idx) => {
    const qty = item.qty || 1;
    const price = item.price || 0;
    const itemTotal = price * qty;
    const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
    const sku = String(item.product || item._id || '').slice(-6).toUpperCase();
    return [
      String(idx + 1),
      `${item.title || 'Product'}\nSKU: ${sku}`,
      '8517',
      String(qty),
      formatPdfINR(price),
      formatPdfINR(itemTaxable),
      '18%',
      formatPdfINR(itemTotal),
    ];
  });

  autoTable(doc, {
    startY: 97,
    margin: { left: 10, right: 10 },
    head: [
      [
        '#',
        'Description of Goods',
        'HSN',
        'Qty',
        'Unit Rate',
        'Taxable Val',
        'GST',
        'Amount',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      lineColor: [226, 232, 240],
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
  });

  let curFinalY = doc.lastAutoTable.finalY + 4;
  const ledgerHeight = 44;
  // Position at the very last of the invoice (anchored to bottom of A4 page)
  const targetBottomY = pageHeight - 16 - ledgerHeight;
  if (curFinalY < targetBottomY) {
    curFinalY = targetBottomY;
  } else if (curFinalY + ledgerHeight > pageHeight - 16) {
    doc.addPage();
    curFinalY = pageHeight - 16 - ledgerHeight;
  }

  // 6. Right Side: Financial Ledger Box
  const lW = 75;
  const lX = pageWidth - 10 - lW;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(lX, curFinalY, lW, ledgerHeight, 1.5, 1.5, 'FD');

  let rY = curFinalY + 4.5;
  const addLedgerRow = (lbl, val, boldVal = false, color = [15, 23, 42]) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, lX + 3, rY);
    doc.setFont('helvetica', boldVal ? 'bold' : 'normal');
    doc.setTextColor(...color);
    doc.text(val, lX + lW - 3, rY, { align: 'right' });
    rY += 4.5;
  };

  addLedgerRow('Gross Items Total:', formatPdfINR(calculatedItemsTotal));
  if (discountAmount > 0) {
    const couponLabel = order.couponCode
      ? `Coupon (${order.couponCode}):`
      : 'Coupon Discount:';
    addLedgerRow(couponLabel, `-${formatPdfINR(discountAmount)}`, true, [
      16, 185, 129,
    ]);
  }
  addLedgerRow('Net Taxable Value:', formatPdfINR(taxableValue));
  if (isIntraState) {
    addLedgerRow('CGST (9.0%):', formatPdfINR(totalGst / 2));
    addLedgerRow('SGST (9.0%):', formatPdfINR(totalGst / 2));
  } else {
    addLedgerRow('IGST (18.0%):', formatPdfINR(totalGst));
  }
  addLedgerRow(
    'Shipping & Handling:',
    shippingPrice > 0 ? formatPdfINR(shippingPrice) : 'FREE (Rs. 0.00)',
    false,
    shippingPrice > 0 ? [15, 23, 42] : [16, 185, 129]
  );

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(lX + 2, rY, lX + lW - 2, rY);
  rY += 4;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT:', lX + 3, rY);
  doc.setFontSize(9.5);
  doc.setTextColor(217, 119, 6);
  doc.text(formatPdfINR(grandTotal), lX + lW - 3, rY, { align: 'right' });

  // 7. Left Side: Amount in Words & Legal Terms Box
  const leftW = lX - 10 - 4;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, curFinalY, leftW, ledgerHeight, 1.5, 1.5, 'FD');

  let lY = curFinalY + 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT IN WORDS:', 13, lY);
  lY += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  const words = doc.splitTextToSize(numberToWords(grandTotal), leftW - 6);
  doc.text(words, 13, lY);
  lY += words.length * 4 + 2;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TERMS & CONDITIONS:', 13, lY);
  lY += 4;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('1. All items backed by Shoply 30-Day Money-Back Guarantee.', 13, lY);
  lY += 3.5;
  doc.text(
    '2. Warranty claims eligible at all brand authorized service centers.',
    13,
    lY
  );
  lY += 3.5;
  doc.text(
    '3. This is an electronically generated tax invoice under CGST Act 2017.',
    13,
    lY
  );


  // 9. Standard A4 Outer Frame & Footer Pagination across all generated pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Clean A4 decorative border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12);

    // Standard A4 pagination footer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}  |  ISO 216 Standard A4 Format (210 x 297 mm)  |  Official GST Compliant Tax Invoice`,
      pageWidth / 2,
      pageHeight - 9,
      { align: 'center' }
    );
  }

  return doc;
}

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  const printRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !order) return null;

  const invoiceNo = `INV-${order._id ? order._id.slice(-8).toUpperCase() : '00000000'}`;
  const buyingDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const buyerState = order.shippingAddress?.state || 'Maharashtra';
  const buyerStateCode = getStateCode(buyerState);
  const isIntraState = buyerStateCode === '29'; // Supplier state is Karnataka (29)

  const calculatedItemsTotal =
    order.itemsPrice ||
    order.orderItems?.reduce(
      (acc, item) => acc + (item.price || 0) * (item.qty || 1),
      0
    ) ||
    order.totalPrice ||
    0;

  const discountAmount = order.discountAmount || 0;
  const netBeforeTax = Math.max(0, calculatedItemsTotal - discountAmount);
  const taxableValue = Math.round((netBeforeTax / 1.18) * 100) / 100;
  const totalGst = Math.round((netBeforeTax - taxableValue) * 100) / 100;
  const shippingPrice = order.shippingPrice || 0;
  const grandTotal = order.totalPrice || netBeforeTax + shippingPrice;

  // Direct, zero-prompt client-side PDF file download
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = generateInvoicePdf(jsPDF, autoTable, order);
      // Directly triggers the browser's file save dialog/download without asking anything
      doc.save(`Shoply-Invoice-${invoiceNo}.pdf`);
      addToast?.('A4 Invoice downloaded successfully!', 'success');
    } catch (err) {
      console.error('Direct PDF download error:', err);
      addToast?.('Failed to download invoice. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Strict A4 Print Stylesheet for Browser Printing & PDF Saving */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #shoply-printable-bill, #shoply-printable-bill * {
            visibility: visible !important;
          }
          #shoply-printable-bill {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 12mm 14mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            z-index: 999999 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      ></div>

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#0c1427] text-slate-900 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 my-4 sm:my-6 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white print:text-black">
        {/* Top Header Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  TAX INVOICE / BILL OF SUPPLY
                </span>
                <span className="font-mono text-xs text-amber-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                  {invoiceNo}
                </span>
                {/* Standard A4 Badge */}
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  A4 Size (210 × 297 mm)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                GST Compliant Standard A4 Tax Invoice & Lifetime Warranty Certificate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Direct A4 PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Download A4 PDF directly without any prompts"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Downloading A4 PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF (A4)</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Print via Printer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-slate-800"
              title="Close Invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="max-h-[82vh] overflow-y-auto bg-slate-200/70 dark:bg-slate-950/80 p-3 sm:p-6 print:p-0 print:max-h-none print:overflow-visible flex justify-center">
          {/* Printable Invoice Sheet (True ISO 216 A4 Paper Aspect Ratio: 210mm x 297mm) */}
          <div
            id="shoply-printable-bill"
            ref={printRef}
            style={{ minHeight: '297mm', width: '100%', maxWidth: '210mm' }}
            className="w-full max-w-[210mm] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300/80 p-6 sm:p-10 text-xs transition-all relative flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:p-6 print:m-0 print:w-[210mm] print:max-w-[210mm] print:min-h-[297mm]"
          >
            {/* Top Invoice Body Section */}
            <div className="flex-1 space-y-6">
              {/* Top Official Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900 pb-5">
              {/* Left: Supplier Identity */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-amber-400 text-xl shadow-xs">
                    S
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-950 font-sans leading-none">
                      SHOPLY
                    </h1>
                    <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500">
                      Premier Luxury Marketplace
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-600 leading-relaxed">
                  <p className="font-extrabold text-slate-900">
                    Shoply Commerce Technologies Private Limited
                  </p>
                  <p>
                    Prestige Tech Cloud, Tower B, Electronic City, Bengaluru, KA -
                    560066
                  </p>
                  <p className="font-mono text-slate-700 text-[10.5px]">
                    <strong>GSTIN:</strong> 27AAACS1429B1Z8 · <strong>CIN:</strong>{' '}
                    U74999MH2026PTC392811
                  </p>
                  <p>
                    <strong>Email:</strong> care@shoply.com ·{' '}
                    <strong>Toll-Free:</strong> 1800-246-8000
                  </p>
                </div>
              </div>

              {/* Right: Invoice Metadata */}
              <div className="sm:text-right space-y-1.5 w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-slate-200">
                <div className="flex sm:justify-end gap-1.5 items-center">
                  <span className="inline-block bg-slate-950 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                    TAX INVOICE
                  </span>
                  <span className="inline-block bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-amber-300">
                    Original for Recipient
                  </span>
                </div>

                <p className="text-lg font-black text-slate-950 font-mono tracking-tight pt-1">
                  {invoiceNo}
                </p>

                <div className="space-y-0.5 text-[11px] text-slate-600">
                  <p>
                    <strong className="text-slate-900">Order ID:</strong> #{order._id}
                  </p>
                  <p className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-bold inline-block sm:block sm:px-0 sm:bg-transparent">
                    <strong className="text-slate-900">Buying Date:</strong>{' '}
                    {buyingDateFormatted}
                  </p>
                  <p>
                    <strong className="text-slate-900">Place of Supply:</strong>{' '}
                    {buyerState} (Code: {buyerStateCode})
                  </p>
                  <div className="pt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        order.isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {order.isPaid ? 'Payment Confirmed' : 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Grid: Supplier vs Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supplier Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Sold By / Supplier Details
                </span>
                <p className="font-extrabold text-slate-950 text-sm">
                  Shoply Fulfillment Center Hub-4
                </p>
                <p className="text-slate-700 text-[11px]">
                  Electronic City Industrial Area, Phase 1
                </p>
                <p className="text-slate-700 text-[11px]">
                  Bengaluru, Karnataka - 560100, India
                </p>
                <p className="text-slate-700 text-[11px]">
                  <strong className="text-slate-900">State:</strong> Karnataka
                  (State Code: 29)
                </p>
                <p className="text-slate-700 text-[11px]">
                  <strong className="text-slate-900">GSTIN:</strong>{' '}
                  27AAACS1429B1Z8
                </p>
              </div>

              {/* Recipient / Buyer Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Billed To & Shipped To (Buyer)
                </span>
                <p className="font-extrabold text-slate-950 text-sm">
                  {order.shippingAddress?.fullName ||
                    order.user?.name ||
                    'Valued Customer'}
                </p>
                <p className="text-slate-700 text-[11px]">
                  {order.shippingAddress?.street || 'Standard Delivery Address'}
                </p>
                <p className="text-slate-700 text-[11px]">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  <span className="font-bold">
                    {order.shippingAddress?.postalCode}
                  </span>
                </p>
                <p className="text-slate-700 text-[11px]">
                  {order.shippingAddress?.country || 'India'}
                </p>
                {order.shippingAddress?.phone && (
                  <p className="text-[11px] text-slate-800 font-semibold pt-0.5">
                    Contact: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Logistics & Payment Channel Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
              <div>
                <strong className="text-slate-900">Payment Mode:</strong>{' '}
                <span>
                  {order.paymentMethod || 'Cash on Delivery'}
                  {order.isPaid ? (
                    <span className="ml-1 text-emerald-700 font-bold">
                      (PAID{order.paymentResult?.id ? ` · Ref: ${order.paymentResult.id}` : ''})
                    </span>
                  ) : (
                    <span className="ml-1 text-amber-700 font-medium">
                      (Pending)
                    </span>
                  )}
                </span>
              </div>
              <div>
                <strong className="text-slate-900">Dispatch Partner:</strong>{' '}
                Shoply Insured Express Air Courier
              </div>
              <div>
                <strong className="text-slate-900">Order Status:</strong>{' '}
                <span className="font-bold uppercase text-amber-700">
                  {order.status || 'Confirmed'}
                </span>
              </div>
            </div>

            {/* Itemized Tax Invoice Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3">Description of Goods</th>
                    <th className="py-2.5 px-3 text-center w-16">HSN</th>
                    <th className="py-2.5 px-3 text-center w-14">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right w-24">Taxable Val</th>
                    <th className="py-2.5 px-3 text-center w-16">GST</th>
                    <th className="py-2.5 px-3 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {order.orderItems?.map((item, index) => {
                    const itemQty = item.qty || 1;
                    const itemPrice = item.price || 0;
                    const lineTotal = itemPrice * itemQty;
                    const lineTaxable = Math.round((lineTotal / 1.18) * 100) / 100;
                    const sku = String(item.product || item._id || '')
                      .slice(-6)
                      .toUpperCase();

                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-950">{item.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            SKU: {sku}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">
                          8517
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {itemQty}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatINR(itemPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono text-[11px]">
                          {formatINR(lineTaxable)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 text-[11px] font-semibold">
                          18%
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-950 font-mono">
                          {formatINR(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section Anchored at the Down Side / Very Last of the Invoice */}
          <div className="mt-auto pt-8 space-y-4">
            {/* Last Section of Invoice: Amount in Words & Terms (Left) + Financial Ledger (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              {/* Left Side: Amount in Words & Terms and Conditions */}
              <div className="sm:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                    AMOUNT IN WORDS:
                  </span>
                  <p className="font-bold text-slate-950 text-xs sm:text-sm">
                    {numberToWords(grandTotal)}
                  </p>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                    TERMS & CONDITIONS:
                  </span>
                  <ol className="text-[10.5px] text-slate-600 space-y-1 list-none leading-relaxed">
                    <li>1. All items backed by Shoply 30-Day Money-Back Guarantee.</li>
                    <li>2. Warranty claims eligible at all brand authorized service centers.</li>
                    <li>3. This is an electronically generated tax invoice under CGST Act 2017.</li>
                  </ol>
                </div>
              </div>

              {/* Right Side: Financial Ledger */}
              <div className="sm:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Gross Items Total:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(calculatedItemsTotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-[11px]">
                    <span className="font-semibold">
                      Coupon Savings {order.couponCode ? `(${order.couponCode})` : ''}:
                    </span>
                    <span className="font-mono font-bold">
                      -{formatINR(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Net Taxable Value:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatINR(taxableValue)}
                  </span>
                </div>

                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>CGST (9.0%):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatINR(totalGst / 2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>SGST (9.0%):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatINR(totalGst / 2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>IGST (18.0%):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(totalGst)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Shipping & Handling:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {shippingPrice > 0
                      ? formatINR(shippingPrice)
                      : 'FREE (Complimentary)'}
                  </span>
                </div>

                <div className="border-t-2 border-slate-900 pt-2.5 mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-950 block">
                      TOTAL AMOUNT:
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      All Applicable Taxes Included
                    </span>
                  </div>
                  <span className="font-mono text-lg font-black text-slate-950">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard A4 Footer Details */}
            <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between items-center text-[9.5px] text-slate-400 gap-1 print:flex">
              <span>Shoply Commerce Technologies Pvt Ltd · Official GST Tax Invoice</span>
              <span className="font-mono">Page 1 of 1 · ISO 216 Standard A4 Format (210 × 297 mm)</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
