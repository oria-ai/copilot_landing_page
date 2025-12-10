import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ValueSections from '@/components/ValueSections';
import SocialProof from '@/components/SocialProof';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
      <Navbar />
      <Hero />
      <ValueSections />
      <SocialProof />
      <Footer />
    </main>
  );
}
