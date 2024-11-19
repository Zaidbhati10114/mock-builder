// app/metadata.ts
import { Metadata } from 'next';

export const constructMetadata = (): Metadata => ({
    title: {
        default: 'MockBuilder - AI Powered Mock JSON Data Generation',
        template: '%s | MockBuilder'
    },
    description: 'Create, Edit, Save, and Fetch Your Mock JSON Data with Ease. Generate realistic data in seconds using AI-powered tools.',
    keywords: [
        'mock data',
        'JSON generation',
        'AI data',
        'development tools',
        'API mocking',
        'data simulation'
    ],
    authors: [{ name: 'Your Name', url: 'https://yourwebsite.com' }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://mockbuilder.com',
        title: 'MockBuilder - AI Powered Mock JSON Data Generation',
        description: 'Create, Edit, Save, and Fetch Your Mock JSON Data with Ease',
        siteName: 'MockBuilder',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'MockBuilder - Generate Mock Data'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MockBuilder - AI Powered Mock JSON Data Generation',
        description: 'Create, Edit, Save, and Fetch Your Mock JSON Data with Ease',
        images: ['/twitter-image.png']
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png'
    }
});

export const metadata = constructMetadata();