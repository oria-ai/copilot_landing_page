"use client";

import ExpressPayment from "./_components/ExpressPayment";
import PurchaseFAQ from "./_components/PurchaseFAQ";
import Footer from "../../components/Footer";
import CourseCarousel from "./_components/CourseCarousel";

export default function PurchasePage() {
    return (
        <div className="min-h-screen bg-white text-[#2D2D2D] font-sans selection:bg-purple-200">
            <main>
                {/* 1. Carousel Section (Lilac Background) */}
                <CourseCarousel />

                {/* 2. Express Payment Section (White Background) */}
                <ExpressPayment />

                {/* 3. FAQ Section (White Background) */}
                <PurchaseFAQ />
            </main>

            <Footer />
        </div>
    );
}
