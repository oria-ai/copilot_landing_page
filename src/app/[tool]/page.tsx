import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ValueSections from '@/components/ValueSections';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

// Map URL slugs to tab IDs (for user-friendly URLs)
const slugToTabId: Record<string, string> = {
    'word': 'word',
    'excel': 'excel',
    'powerpoint': 'ppt',
    'ppt': 'ppt',
    'teams': 'teams',
    'outlook': 'outlook',
    'chat': 'chat',
    'onedrive': 'onedrive',
};

interface ToolPageProps {
    params: Promise<{ tool: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
    const { tool } = await params;
    const tabId = slugToTabId[tool.toLowerCase()];

    // Return 404 if invalid tool
    if (!tabId) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            <ScrollToTop />
            <Navbar />
            <Hero initialTool={tabId} />
            <ValueSections />
            <SocialProof />
            <Footer />
        </main>
    );
}
