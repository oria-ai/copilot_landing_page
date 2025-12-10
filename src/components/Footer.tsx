export default function Footer() {
    return (
        <footer className="py-12 px-4 border-t border-white/10 bg-black text-gray-400 text-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
                <div>
                    © 2024 Copilot Inside. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
