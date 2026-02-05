'use client';
// import { signOut } from 'next-auth/react';
import { useState } from 'react';
// import { useSession } from 'next-auth/react';
import Image from 'next/image';
export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
//    const { data: session } = useSession()

    return (
        <header className="bg-[#262a34] border-b border-[#262a34] sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                                <p className="text-[#999999] text-sm">{/* session?.user?.email */}</p>
                            </div>

                            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8">
                                <div className="bg-orange-500 p-4 flex items-center justify-center h-28 w-48 shadow-lg">
                                    <Image
                                      src="/logo-white.svg"
                                      alt="Winkels Logo"
                                      width={180}
                                      height={90}
                                      className="h-20 w-auto"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative">
                                <a href="/admin/help" className="text-white hover:text-orange-500 transition text-lg">
                                    ❓
                                </a>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition"
                                >
                                    <span className="text-white">⚙️</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                                        <button
                                            onClick={async () => {
                                               // await signOut({ redirect: true, callbackUrl: '/admin/login' })
                                            }}
                                            className="w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 font-medium transition whitespace-nowrap"
                                        >
                                            Abmelden
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
    )
}