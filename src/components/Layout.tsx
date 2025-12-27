import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Users, Shield, DollarSign, Target, Settings } from "lucide-react";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/members", label: "Members", icon: Users },
    { href: "/teams", label: "Teams", icon: Shield },
    { href: "/invoices", label: "Invoices", icon: DollarSign },
    { href: "/coaching", label: "Coaching", icon: Target },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-16 h-16 rounded-full bg-white p-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="Bali Bulldogs FC"
                  width={64}
                  height={64}
                  className="rounded-full object-contain"
                  priority
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Bali Bulldogs FC
                </h1>
                <p className="text-sm text-yellow-300 font-medium">
                  WE NEVER WALK ALONE
                </p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-400 text-blue-900 shadow-lg scale-105"
                        : "text-white hover:bg-blue-700 hover:scale-105"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden lg:inline">{item.label}</span>
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
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-6 mt-12 border-t-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-yellow-300">
                PT DOJI BALI INDONESIA (Bali Bulldogs)
              </p>
              <p className="text-sm text-blue-200">
                Jl. Subak Sari No.72, Tibubeneng, Kec. Kuta Utara, Kabupaten Badung, Bali 80361
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-blue-200">📞 +62 813-8447-4406</p>
              <p className="text-sm text-blue-200">✉️ info@balibulldogsfc.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}