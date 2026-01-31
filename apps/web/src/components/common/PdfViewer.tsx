import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ScrollText, FileText } from 'lucide-react';
import './PdfViewer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    pdfUrl: string;
    onClose: () => void;
    title?: string;
}

const getGoogleDriveId = (url: string): string | null => {
    // Regex for:
    // 1. /file/d/VIDEO_ID/view
    // 2. id=VIDEO_ID
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

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, onClose, title }) => {
    const googleDriveId = getGoogleDriveId(pdfUrl);

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isVerticalScroll, setIsVerticalScroll] = useState<boolean>(true);
    const observerRef = React.useRef<IntersectionObserver | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    // Intersection Observer for Scroll Mode
    React.useEffect(() => {
        if (isVerticalScroll) {
            const options = {
                root: document.querySelector('.pdf-content'),
                rootMargin: '0px',
                threshold: 0.5
            };

            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const pageNum = Number(entry.target.getAttribute('data-page-number'));
                        if (!isNaN(pageNum)) {
                            setPageNumber(pageNum);
                        }
                    }
                });
            }, options);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [isVerticalScroll, numPages]);

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));

    return (
        <div className="pdf-modal-overlay">
            <div className="pdf-modal-container">
                {/* Header */}
                <div className="pdf-header">
                    <h3 className="pdf-title">{title || 'Document Viewer'}</h3>
                    <div className="pdf-controls">
                        {!googleDriveId && (
                            <>
                                <div className="zoom-controls">
                                    <button onClick={() => setIsVerticalScroll(!isVerticalScroll)} title={isVerticalScroll ? "Switch to Single Page" : "Switch to Scroll View"}>
                                        {isVerticalScroll ? <FileText size={20} /> : <ScrollText size={20} />}
                                    </button>
                                    <div className="divider-vertical" style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
                                    <button onClick={zoomOut} disabled={scale <= 0.6} title="Zoom Out">
                                        <ZoomOut size={20} />
                                    </button>
                                    <span className="scale-display">{Math.round(scale * 100)}%</span>
                                    <button onClick={zoomIn} disabled={scale >= 2.0} title="Zoom In">
                                        <ZoomIn size={20} />
                                    </button>
                                </div>
                                <div className="page-nav">
                                    {!isVerticalScroll && (
                                        <button onClick={previousPage} disabled={pageNumber <= 1}>
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <span className="page-info">
                                        Page {pageNumber} of {numPages || '--'}
                                    </span>
                                    {!isVerticalScroll && (
                                        <button onClick={nextPage} disabled={pageNumber >= (numPages || 1)}>
                                            <ChevronRight size={20} />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="pdf-content">
                    {googleDriveId ? (
                        <iframe
                            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
                            className="pdf-iframe"
                            title="PDF Viewer"
                            allow="autoplay"
                        ></iframe>
                    ) : (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="pdf-document"
                            loading={<div className="pdf-loading">Loading PDF...</div>}
                            error={<div className="pdf-error">Failed to load PDF. Please check the URL.</div>}
                        >
                            <div className="pdf-page-wrapper">
                                {!isVerticalScroll ? (
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                    />
                                ) : (
                                    Array.from(new Array(numPages), (_, index) => (
                                        <div
                                            key={`page_${index + 1}`}
                                            className="pdf-page-container"
                                            data-page-number={index + 1}
                                            ref={(el) => {
                                                if (el && observerRef.current) {
                                                    observerRef.current.observe(el);
                                                }
                                            }}
                                        >
                                            <Page
                                                pageNumber={index + 1}
                                                scale={scale}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                            />
                                        </div>
                                    ))
                                )}
                                {/* Watermark Overlay - Only show on single page view or handle per page in scroll view via CSS if needed, 
                                    but for now keeping it simple. The original watermark was absolutely positioned over the wrapper. 
                                    In scroll mode, we might want it per page, or fixed over the viewport. 
                                    Given structure, let's keep it consistent. 
                                    If isVerticalScroll, we might need a different strategy for watermark if it's supposed to be on every page.
                                    The current CSS .watermark-overlay is absolute to .pdf-page-wrapper. 
                                    In scroll mode, .pdf-page-wrapper contains all pages. 
                                    Let's adjust to ensure it covers properly or duplicate it if needed.
                                    Actually, for scroll mode, it's better to having it per page or fixed.
                                    For this iteration, I'll stick to a fixed watermark if possible, or per page.
                                    Let's put the watermark INSIDE the conditional rendering to be safe.
                                */}
                                {!isVerticalScroll && (
                                    <div className="watermark-overlay">
                                        <div className="watermark-text">Brinda Series Sample</div>
                                        <div className="watermark-text">Brinda Series Sample</div>
                                        <div className="watermark-text">Brinda Series Sample</div>
                                    </div>
                                )}
                            </div>
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
