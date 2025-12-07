'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Heart, Clock, Search, TrendingUp, Star, Users, Shield, Zap, ChevronRight, Sparkles, Library, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dummy books data
  const booksRow1 = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop' },
    { id: 3, title: '1984', author: 'George Orwell', cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop' },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop' },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop' },
  ];

  const booksRow2 = [
    { id: 6, title: 'Harry Potter', author: 'J.K. Rowling', cover: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop' },
    { id: 7, title: 'The Hobbit', author: 'J.R.R. Tolkien', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop' },
    { id: 8, title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=300&h=400&fit=crop' },
    { id: 9, title: 'Educated', author: 'Tara Westover', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop' },
    { id: 10, title: 'Becoming', author: 'Michelle Obama', cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop' },
  ];

  const booksRow3 = [
    { id: 11, title: 'Atomic Habits', author: 'James Clear', cover: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop' },
    { id: 12, title: 'The Alchemist', author: 'Paulo Coelho', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' },
    { id: 13, title: 'Think Again', author: 'Adam Grant', cover: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300&h=400&fit=crop' },
    { id: 14, title: 'The Silent Patient', author: 'Alex Michaelides', cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop' },
    { id: 15, title: 'Project Hail Mary', author: 'Andy Weir', cover: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=300&h=400&fit=crop' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-emerald-50 overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Puskata
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-6 py-2.5 text-gray-700 font-medium hover:text-emerald-600 transition"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

{/* Hero Section – Sekarang tampil persis seperti section "Why Choose Puskata" */}
<section className="py-32 px-4 bg-gray-50">
  <div className="max-w-7xl mx-auto text-center">
    {/* Welcome badge */}
    <div className="mb-8">
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium">
        <Sparkles className="w-4 h-4" />
        Welcome to Modern Library System
      </span>
    </div>

    {/* Judul utama */}
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
      Discover Your Next
      <br />
      <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
        Great Read
      </span>
    </h1>

    {/* Deskripsi */}
    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
      Access thousands of books, manage your reading list, and track your borrowing history all in one place
    </p>

    {/* Tombol CTA */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
      <Link 
        href="/register"
        className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
      >
        Start Reading Free
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
      </Link>
      <Link 
        href="/login"
        className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all"
      >
        Sign In
      </Link>
    </div>

    {/* Stats – sama seperti sebelumnya */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        { label: 'Books Available', value: '10,000+', icon: BookOpen },
        { label: 'Active Readers', value: '5,000+', icon: Users },
        { label: 'Books Borrowed', value: '50,000+', icon: TrendingUp },
        { label: 'User Satisfaction', value: '98%', icon: Star },
      ].map((stat, i) => (
        <div key={i} className="text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <stat.icon className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Choose Puskata?</h2>
            <p className="text-xl text-gray-600">Everything you need for your reading journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Search',
                description: 'Find any book instantly with our powerful search engine',
                color: 'from-emerald-500 to-cyan-500',
              },
              {
                icon: Heart,
                title: 'Wishlist',
                description: 'Save books you want to read and never forget them',
                color: 'from-pink-500 to-rose-500',
              },
              {
                icon: Clock,
                title: 'Track Loans',
                description: 'Monitor your borrowed books and due dates effortlessly',
                color: 'from-purple-500 to-indigo-500',
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Your data is protected with enterprise-grade security',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized performance for the best user experience',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Library,
                title: 'Rich Collection',
                description: 'Access to thousands of books across all genres',
                color: 'from-emerald-500 to-green-500',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Ready to Start Reading?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Join thousands of readers and start your literary journey today
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Puskata</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your digital library companion for managing and discovering amazing books.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#features" className="hover:text-emerald-600 transition">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-emerald-600 transition">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Contact</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-emerald-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} Puskata. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
        }

        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }

        .animate-scroll-right:hover,
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}