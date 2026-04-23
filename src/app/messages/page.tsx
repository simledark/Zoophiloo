import { Navbar } from "@/components/layout/navbar";
import { MessagesLayout } from "@/components/messages/messages-layout";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 container-app py-6">
        <MessagesLayout />
      </main>
    </div>
  );
}
