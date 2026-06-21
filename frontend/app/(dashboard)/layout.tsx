"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map, LogOut, User, Plus } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("trao_token");
    const storedUser = localStorage.getItem("trao_user");
    if (!token || !storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("trao_token");
    localStorage.removeItem("trao_user");
    router.push("/");
  };

  if (!user) return <div className="min-h-screen bg-background" />; // Prevent hydration flash

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Map className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">Aurora Travel</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/create-trip"
              className="flex items-center gap-1 text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4 border-l border-border pl-4">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline-block">{user.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
