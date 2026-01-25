import SupabaseTestClient from "./supabase-test-client";

export default function SupabaseTestPage() {
  // Dev-only guard. This route should not be accessible in production builds.
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-bold text-white">Not available</h1>
        <p className="mt-2 text-sm text-[#a0a0a0]">
          This page is only available in development.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-bold text-white">Supabase Connection Test</h1>
      <p className="mt-2 text-sm text-[#a0a0a0]">
        Setup note: changes to <code className="text-white">.env.local</code>{" "}
        require restarting <code className="text-white">npm run dev</code>.
      </p>
      <div className="mt-6">
        <SupabaseTestClient />
      </div>
    </div>
  );
}

