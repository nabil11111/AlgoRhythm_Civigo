import { getProfile } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AssistantInterface from "./_components/AssistantInterface";

export default async function AssistantPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "citizen") {
    redirect("/onboarding");
  }

  // Check if agent is enabled
  const agentEnabled = process.env.AGENT_ENABLED === "true";

  if (!agentEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            AI Assistant Unavailable
          </h1>
          <p className="text-gray-600">
            The AI assistant feature is currently disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">AI Assistant</h1>
          <p className="text-white/80 mt-1 text-sm sm:text-base">
            Get help with appointments, documents, and government services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 sm:p-6">
            <AssistantInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
