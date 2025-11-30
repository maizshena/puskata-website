'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Puskata
        </Link>
        
        <div className="flex gap-4 items-center">
          {session ? (
            <>
              {session.user.role === 'admin' ? (
                <>
                  <Link href="/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                  <Link href="/collections" className="hover:underline">
                    Collections
                  </Link>
                  <Link href="/loan_management" className="hover:underline">
                    Loan Management
                  </Link>
                  <Link href="/users" className="hover:underline">
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/home" className="hover:underline">
                    Home
                  </Link>
                  <Link href="/books" className="hover:underline">
                    Books
                  </Link>
                  <Link href="/loans" className="hover:underline">
                    My Loans
                  </Link>
                  <Link href="/wishlist" className="hover:underline">
                    Wishlist
                  </Link>
                </>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-blue-700 px-3 py-2 rounded"
                >
                  <span>👤 {session.user.name}</span>
                  <span className="text-xs">▼</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      ⚙️ Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}