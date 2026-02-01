export type GradeLevel = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10';

export interface Book {
    id: string;
    title: string;
    subject: string;
    grade: GradeLevel;
    coverImage?: string;
    features: string[];
    price: number;
    samplePdf?: string;
    sampleUrl?: string;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string; // e.g., "Principal, ZPHS Hyderabad"
    content: string;
}

export interface NavItem {
    label: string;
    path: string;
}

export interface PaperType {
    title: string;
    description: string;
    icon: string;
    samplePdf?: string;
}

export interface DigitalModule {
    tag: string;
    title: string;
    desc: string;
    url: string;
    thumbnail?: string;
    duration?: string;
}
