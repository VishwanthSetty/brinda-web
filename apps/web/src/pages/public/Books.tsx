import React, { useState } from 'react';
import { BOOKS, GRADES } from '../../data/constants';
import { Book } from '../../data/types';
import ScrollReveal from '../../components/common/ScrollReveal';
import BookCover from '../../components/common/BookCover';
import PdfViewer from '../../components/common/PdfViewer';
import { Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import './Books.css';

const Books: React.FC = () => {
    const [selectedGrade, setSelectedGrade] = useState<string>('All');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredBooks = BOOKS.filter(book => {
        const matchesGrade = selectedGrade === 'All' || book.grade === selectedGrade;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            book.title.toLowerCase().includes(searchLower) ||
            book.subject.toLowerCase().includes(searchLower) ||
            book.grade.toLowerCase().includes(searchLower);

        return matchesGrade && matchesSearch;
    });

    return (
        <div className="books-page">
            <div className="books-hero">
                <div className="container">
                    <ScrollReveal>
                        <h1>Our Publications</h1>
                        <p>Comprehensive study materials designed to help students excel in every subject from Class 6 to Class 10.</p>
                    </ScrollReveal>
                </div>
            </div>

            <div className="container">
                {/* Search and Filters */}
                <ScrollReveal>
                    <div className="controls-section">
                        <div className="search-bar-container">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by subject or class..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="filters-container">
                            <button
                                className={`filter-btn ${selectedGrade === 'All' ? 'active' : ''}`}
                                onClick={() => setSelectedGrade('All')}
                            >
                                All Classes
                            </button>
                            {GRADES.map(grade => (
                                <button
                                    key={grade}
                                    className={`filter-btn ${selectedGrade === grade ? 'active' : ''}`}
                                    onClick={() => setSelectedGrade(grade)}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Books Grid */}
                <div className="books-grid">
                    {filteredBooks.map((book) => (
                        <ScrollReveal key={book.id}>
                            <div className="book-card">
                                <div className="book-img-wrapper">
                                    <BookCover
                                        coverImage={book.coverImage}
                                        samplePdf={book.samplePdf}
                                        title={book.title}
                                        className="book-img"
                                    />
                                    <span className="book-grade-badge">{book.grade}</span>
                                </div>
                                <div className="book-content">
                                    <div className="book-subject">{book.subject}</div>
                                    <h3 className="book-title">{book.title}</h3>

                                    <div className="book-features">
                                        {book.features.map((feature, idx) => (
                                            <div key={idx} className="feature-tag">
                                                <Check size={14} className="check-icon" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="book-footer">
                                        <button
                                            className="btn-book-details"
                                            onClick={() => {
                                                if (book.samplePdf) {
                                                    setSelectedBook(book);
                                                } else {
                                                    toast.error("Sample PDF not available for this book yet.");
                                                }
                                            }}
                                        >
                                            View Sample
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No books found for this selection.
                    </div>
                )}

                {/* PDF Viewer Modal */}
                {selectedBook && selectedBook.samplePdf && (
                    <PdfViewer
                        pdfUrl={selectedBook.samplePdf}
                        title={`${selectedBook.title} - Sample`}
                        onClose={() => setSelectedBook(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Books;
