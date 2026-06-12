# PDF Export Feature for Invoices

## Overview
This feature allows users to export invoice details to a professionally formatted PDF document that can be downloaded directly from the invoice detail page.

## Features
- **Professional Layout**: Clean, business-ready PDF format with company branding
- **Complete Invoice Data**: Includes all invoice details, line items, and totals
- **Automatic Filename**: Generated filename includes invoice number and ID for easy organization
- **French Localization**: All text and formatting follows French business standards
- **Error Handling**: Graceful handling of empty invoices and generation errors

## Technical Implementation

### Dependencies Added
- `jspdf`: Core PDF generation library
- `jspdf-autotable`: Professional table formatting for invoice lines
- `@types/jspdf`: TypeScript definitions

### Files Created/Modified
1. **`src/app/utils/pdfGenerator.ts`**: Core PDF generation utility
2. **`src/app/achat/invoices/[id]/invoice-detail-client.tsx`**: Added export button and functionality

### PDF Layout Features
- **Header**: Company branding with invoice title
- **Company Info**: Customizable company details (name, address, contact)
- **Invoice Details Box**: Invoice number, date, status, and supplier
- **Professional Table**: Line items with proper formatting and totals
- **Footer**: Generation timestamp and page numbering
- **Color Scheme**: Consistent with application branding (Indigo primary)

### Usage
1. Navigate to any invoice detail page
2. Click the green "Exporter PDF" button in the header
3. PDF will be automatically generated and downloaded
4. Filename format: `Facture_{invoice.number}_{invoice.id}.pdf`

### Customization
The PDF template can be customized by modifying the company information in `pdfGenerator.ts`:
- Company name
- Address
- Phone number
- Email
- Colors and styling

### Error Handling
- Displays user-friendly error messages if PDF generation fails
- Handles empty invoice lines gracefully
- Validates data before generation

## Future Enhancements
- Add company logo support
- Multiple language support
- Custom PDF templates
- Batch PDF export for multiple invoices
- Email integration for direct sending
