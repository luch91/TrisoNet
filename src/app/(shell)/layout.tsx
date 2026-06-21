import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import PrototypeTour from "@/components/layout/PrototypeTour";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      <PrototypeTour />
    </div>
  );
}
