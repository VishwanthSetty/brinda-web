import { Book, NavItem, PaperType, Testimonial, DigitalModule } from './types';

export const NAV_ITEMS: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Books', path: '/books' },
    { label: 'Question Papers', path: '/papers' },
    { label: 'Digital Bridge Course', path: '/digital' },
    { label: 'For Schools', path: '/schools' },
    { label: 'Contact', path: '/contact' },
];

export const GRADES: string[] = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

export const BOOKS: Book[] = [
    // Class 10
    {
        id: '10-math',
        title: 'SSC Mathematics Master',
        subject: 'Mathematics',
        grade: 'Class 10',
        coverImage: 'https://picsum.photos/seed/math10/300/450',
        features: ['Mind Maps', 'Previous SSC Questions', 'Video Explanations'],
        price: 350,
        samplePdf: '/assets/Assignment - 2 Bio-Informatics.pdf',
    },
    {
        id: '10-sci',
        title: 'General Science Scorer',
        subject: 'Science (Phy & Bio)',
        grade: 'Class 10',
        coverImage: 'https://picsum.photos/seed/sci10/300/450',
        features: ['Concept Visualization', 'Lab Activities', 'Objective Type Q&A'],
        price: 380,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',
    },
    {
        id: '10-soc',
        title: 'Social Studies Companion',
        subject: 'Social Studies',
        grade: 'Class 10',
        coverImage: 'https://picsum.photos/seed/soc10/300/450',
        features: ['Map Pointing Guide', 'Timeline Charts', 'Current Affairs Linkage'],
        price: 320,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',
    },
    // Class 9
    {
        id: '9-math',
        title: 'Mathematics Foundation',
        subject: 'Mathematics',
        grade: 'Class 9',
        coverImage: 'https://picsum.photos/seed/math9/300/450',
        features: ['Basic Concept Booster', 'Step-by-step Solutions', 'Practice Drills'],
        price: 310,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',
    },
    {
        id: '9-eng',
        title: 'English Communicator',
        subject: 'English',
        grade: 'Class 9',
        coverImage: 'https://picsum.photos/seed/eng9/300/450',
        features: ['Grammar Focus', 'Reading Comprehension', 'Composition Skills'],
        price: 280,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',

    },
    // Class 8
    {
        id: '8-sci',
        title: 'Science Explorer',
        subject: 'Science',
        grade: 'Class 8',
        coverImage: 'https://picsum.photos/seed/sci8/300/450',
        features: ['Diagram Practice', 'Simple Definitions', 'Daily Life Examples'],
        price: 290,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',

    },
    // Class 7
    {
        id: '7-tel',
        title: 'Telugu Vachakam Guide',
        subject: 'Telugu',
        grade: 'Class 7',
        coverImage: 'https://picsum.photos/seed/tel7/300/450',
        features: ['Padya Ratnalu Meanings', 'Vyakaranam', 'Easy Notes'],
        price: 240,
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing',

    },
    // Class 6
    {
        id: '6-math',
        title: 'Maths Step-1',
        subject: 'Mathematics',
        grade: 'Class 6',
        coverImage: 'https://picsum.photos/seed/math6/300/450',
        features: ['Activity Based Learning', 'Fun with Numbers', 'Visual Aids'],
        price: 220,
    },
];

export const TESTIMONIALS: Testimonial[] = [
    {
        id: 't1',
        name: 'Ramesh Reddy',
        role: 'Principal, ZPHS Karimnagar',
        content: 'The "Back to Basics" approach in Brinda Series is a game changer. Students can finally understand 10th-grade concepts because they have cleared their lower-class doubts.',
    },
    {
        id: 't2',
        name: 'S. Lakshmi',
        role: 'Parent of Class 10 Student',
        content: 'Brinda Publications helped my daughter immensely. The 5-hour crash course on basic geometry gave her the confidence to tackle SSC math.',
    },
];

export const PAPER_TYPES: PaperType[] = [
    {
        title: 'Revision Tests',
        description: 'Chapter-wise quick tests to recall concepts immediately after learning.',
        icon: 'RefreshCw',
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing'
    },
    {
        title: 'Formative Assessment (FA)',
        description: 'Project works, lab activities, and written works strictly as per CCE pattern.',
        icon: 'ClipboardList',
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing'
    },
    {
        title: 'Model Papers',
        description: 'Full-length mock exams modeled after the latest SSC Public Examination pattern.',
        icon: 'FileCheck',
        samplePdf: 'https://drive.google.com/file/d/1TUQrQ2sZWxohvZpSaXJ3SYy7qoBYUiFA/view?usp=sharing'
    },
];

export const DIGITAL_MODULES: DigitalModule[] = [
    {
        tag: "Maths • Class 9",
        title: "Algebraic Expressions",
        desc: "Reviewing variables, constants, and basic operations.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw", // Example shortened URL
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "12:45"
    },
    {
        tag: "Science • Class 10",
        title: "Chemical Equations",
        desc: "Balancing equations and understanding reaction types.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw",
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "15:20"
    },
    {
        tag: "Social • Class 8",
        title: "Maps & Scale",
        desc: "Understanding directions, scale, and symbols on a map.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw",
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "10:05"
    },
    {
        tag: "English • Class 7",
        title: "Tenses Mastery",
        desc: "A fun guide to past, present, and future tenses.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw",
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "11:30"
    },
    {
        tag: "Maths • Class 10",
        title: "Trigonometry Basics",
        desc: "Introduction to angles, triangles, and ratios.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw",
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "14:50"
    },
    {
        tag: "Bio • Class 9",
        title: "Cell Structure",
        desc: "Visualizing the building blocks of life.",
        url: "https://www.youtube.com/embed/xm8gR0ZPWUw",
        thumbnail: "https://img.youtube.com/vi/xm8gR0ZPWUw/mqdefault.jpg",
        duration: "13:15"
    }
];
