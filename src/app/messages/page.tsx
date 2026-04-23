import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import { MessagesLayout } from "@/components/messages/messages-layout";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 container-app py-6">
        <Suspense fallback={
          <div className="bg-white rounded-2xl border border-sand h-96 flex items-center justify-center">
            <p className="font-space text-ink/40">Chargement des messages...</p>
          </div>
        }>
          <MessagesLayout />
        </Suspense>
      </main>
    </div>
  );
}
