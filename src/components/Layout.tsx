import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Users, Shield, Target, Settings, FileText, MessageSquare } from "lucide-react";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/trialists", label: "Pipeline", icon: Target },
    { href: "/members", label: "Members", icon: Users },
    { href: "/teams", label: "Teams", icon: Shield },
    { href: "/invoices", label: "IDR", icon: FileText, isText: true },
    { href: "/coaching", label: "Coaching", icon: Target },
    { href: "/communication", label: "Comms", icon: MessageSquare, isText: true },
    { href: "/import-logs", label: "Logs", icon: null, isText: true },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-28 h-28 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/Bali_Bulldogs_Logo.png"
                  alt="Bali Bulldogs FC"
                  width={112}
                  height={112}
                  className="object-contain drop-shadow-md rounded-full"
                  priority
                />
              </div>
              <div className="hidden md:block pt-2">
                <h1 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                  Bali Bulldogs FC
                </h1>
                <p className="text-sm text-yellow-300 font-bold tracking-wider uppercase">
                  We Never Walk Alone
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[calc(100vw-200px)] md:max-w-none no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-yellow-400 text-blue-900 shadow-md font-bold"
                        : "text-blue-100 hover:bg-blue-800 hover:text-white"
                    }`}
                  >
                    {item.isText ? (
                      <span className="font-bold">{item.label}</span>
                    ) : (
                      <>
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="hidden lg:inline">{item.label}</span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8 mt-12 border-t-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-lg text-yellow-300 mb-1">
                Bali Bulldogs (PT Bulldogs Pulau Dewata)
              </p>
              <p className="text-sm text-blue-200">
                Jl. Subak Sari No.72, Tibubeneng, Kec. Kuta Utara, Kabupaten Badung, Bali 80361
              </p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <p className="text-sm text-blue-200 hover:text-white transition-colors">
                📞 +62 813-8447-4406
              </p>
              <p className="text-sm text-blue-200 hover:text-white transition-colors">
                ✉️ info@balibulldogsfc.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-blue-700 text-center text-xs text-blue-400">
            © {new Date().getFullYear()} Bali Bulldogs FC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}