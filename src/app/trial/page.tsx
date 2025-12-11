
import Image from "next/image";
import Link from "next/link";
import { Lock, Bell, CheckCircle } from "lucide-react";

export default function TrialPage() {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white">
            {/* Left Side - Image (60% width) */}
            <div className="relative h-64 w-full lg:h-auto lg:w-[60%] overflow-hidden">
                <Image
                    src="/man_using_copilot.png"
                    alt="Man using Copilot"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Subtle overlay if needed */}
                <div className="absolute inset-0 bg-violet-500/5 mix-blend-multiply" />
            </div>

            {/* Right Side - Content (40% width) */}
            <div className="flex w-full flex-col justify-between bg-white lg:w-[40%]">

                {/* Main Content Area - Centered vertically and horizontally */}
                <div className="flex flex-grow flex-col justify-center px-8 py-12 lg:px-16 lg:py-20">
                    <div className="mx-auto w-full max-w-sm">

                        <h1 className="mb-14 text-center text-3xl font-bold tracking-tight text-gray-900 md:text-left md:text-3xl">
                            How your free trial works
                        </h1>

                        <div className="relative space-y-12">
                            {/* Vertical Line - Connecting the dots */}
                            <div className="absolute left-[19px] top-4 h-[calc(100%-40px)] w-[3px] bg-violet-100 rounded-full overflow-hidden">
                                {/* Fill the top part to mimic the 'active' state connection if desired, otherwise just light violet */}
                                <div className="h-[50%] w-full bg-violet-400" />
                            </div>

                            {/* Step 1 */}
                            <div className="relative flex items-start gap-8">
                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white shadow-sm ring-4 ring-white">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Today: Start free trial</h3>
                                    <p className="mt-2 text-base font-medium text-gray-500 leading-snug">
                                        Unlock access to all Copilot tools.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex items-start gap-8">
                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-200 text-white ring-4 ring-white">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Day 5: Trial reminder</h3>
                                    <p className="mt-2 text-base font-medium text-gray-500 leading-snug">
                                        You'll get a reminder via email that your trial is about to end.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex items-start gap-8">
                                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-200 text-white ring-4 ring-white">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Day 7: Subscription begins</h3>
                                    <p className="mt-2 text-base font-medium text-gray-500 leading-snug">
                                        Your subscription will begin and you'll be charged. Cancel anytime before.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 flex justify-center md:justify-start">
                            <button className="w-48 rounded-full bg-gray-900 py-4 text-center text-base font-bold text-white transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                                Continue
                            </button>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-white py-6">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
                        <Link href="/privacy.pdf" target="_blank" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <span className="text-gray-200">|</span>
                        <Link href="/terms.pdf" target="_blank" className="hover:text-gray-900 transition-colors">Terms of Use</Link>
                        <span className="text-gray-200">|</span>
                        <button className="hover:text-gray-900 transition-colors">Accessibility</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
