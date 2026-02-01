import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText } from 'lucide-react';
import './PdfViewer.css'; // Reusing existing PDF styles if needed, or we can add specific ones

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Helper function to extract Google Drive file ID
const getGoogleDriveId = (url: string): string | null => {
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
};

// Convert cover image URL to a displayable format
const getCoverImageUrl = (url: string): string => {
    // Check if it's a Google Drive URL
    const driveId = getGoogleDriveId(url);
    if (driveId) {
        // Use Google Drive thumbnail URL for images
        return `https://drive.google.com/thumbnail?id=${driveId}&sz=w600`;
    }
    // Return the URL as-is for S3 or other direct URLs
    return url;
};

interface BookCoverProps {
    coverImage?: string;
    samplePdf?: string;
    title: string;
    className?: string;
}

// Define options outside component to prevent unnecessary reloads
const PDF_OPTIONS = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
};

const BookCover: React.FC<BookCoverProps> = ({ coverImage, samplePdf, title, className }) => {
    const [loadError, setLoadError] = useState(false);

    function onDocumentLoadSuccess() {
        // Doc loaded
    }

    function onDocumentLoadError() {
        setLoadError(true);
    }

    if (coverImage) {
        const imageUrl = getCoverImageUrl(coverImage);
        return <img src={imageUrl} alt={title} className={className} />;
    }

    if (samplePdf && !loadError) {
        return (
            <div className={`book-cover-pdf-container ${className}`} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <Document
                    file={samplePdf}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={PDF_OPTIONS}
                    loading={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <div className="animate-pulse">Loading...</div>
                        </div>
                    }
                >
                    <Page
                        pageNumber={1}
                        width={300}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>
            </div>
        );
    }

    // Fallback if no cover and no PDF (or PDF failed)
    return (
        <div className={`book-cover-placeholder ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', color: '#64748b' }}>
            <FileText size={48} strokeWidth={1.5} />
            <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', textAlign: 'center', padding: '0 1rem' }}>
                {title}
            </span>
        </div>
    );
};

export default BookCover;
