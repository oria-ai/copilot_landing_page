
import Image from "next/image";
import Link from "next/link";
import { Lock, Bell, CheckCircle } from "lucide-react";

export default function TrialPage() {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white">
            {/* Left Side - Image */}
            <div className="relative h-64 w-full lg:h-auto lg:w-1/2 overflow-hidden">
                <Image
                    src="/man_using_copilot.png"
                    alt="Man using Copilot"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Violet gradient overlay to match the vibe if needed, but keeping it clean for now based on 'this image' request */}
                <div className="absolute inset-0 bg-violet-500/10 mix-blend-multiply" />
            </div>

            {/* Right Side - Content */}
            <div className="flex w-full flex-col justify-between bg-white px-6 py-12 lg:w-1/2 lg:px-24 lg:py-20">
                <div className="mx-auto flex w-full max-w-md flex-col justify-center flex-grow">
                    <h1 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                        How your free trial works
                    </h1>

                    <div className="relative space-y-10">
                        {/* Vertical Line */}
                        <div className="absolute left-[15px] top-4 h-[calc(100%-32px)] w-0.5 bg-violet-100" />

                        {/* Step 1 */}
                        <div className="relative flex items-start gap-6">
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm ring-4 ring-white">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Today: Start free trial</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                    Unlock access to all Copilot tools.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-start gap-6">
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-4 ring-white">
                                <Bell className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Day 5: Trial reminder</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                    You'll get a reminder via email that your trial is about to end.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-start gap-6">
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-4 ring-white">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Day 7: Subscription begins</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                    Your subscription will begin and you'll be charged. Cancel anytime before.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <button className="w-full rounded-full bg-gray-900 py-4 text-center text-base font-bold text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                            Continue
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                    <Link href="/privacy.pdf" target="_blank" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <Link href="/terms.pdf" target="_blank" className="hover:text-gray-900 transition-colors">Terms of Use</Link>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <button className="hover:text-gray-900 transition-colors">Accessibility</button>
                </div>
            </div>
        </div>
    );
}
