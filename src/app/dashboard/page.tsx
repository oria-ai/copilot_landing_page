
import AiCoachingVideo from "@/components/AiCoachingVideo";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome back!</h2>
                    <p className="text-gray-600 mb-4">
                        This involves a scrollable area to demonstrate the video autoplay feature.
                        Scroll down to see your AI Coaching feedback.
                    </p>
                    <div className="h-96 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-4">
                        Spacer Content
                    </div>
                    <div className="h-96 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-4">
                        More Spacer Content
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your AI Coaching Feedback</h2>
                    <AiCoachingVideo src="/ai_feedback.mp4" />
                </div>
            </div>
        </div>
    );
}
