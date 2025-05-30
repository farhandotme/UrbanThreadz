"use client";

import AuthModal from '@/components/ui/AuthModal';
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';

import Cart from './cart';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    };
  }
}

export default function TshirtEcomNavbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = [
    { id: 1, name: 'New Arrivals', subcategories: ['This Week', 'This Month', 'Trending'], path: '/new-arrivals' },
    { id: 2, name: 'Collections', subcategories: ['Graphic Tees', 'Minimalist', 'Vintage', 'Limited Edition'], path: '/collections' },
    { id: 3, name: 'Shop By', subcategories: ['Men', 'Women', 'Unisex'], path: '/shop-by' },
    { id: 4, name: 'Sale', subcategories: ['Clearance', 'Bundle Deals'], path: '/sale' },
  ];

  const { data: session, status } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Close category dropdown
      setActiveCategory(null);

      // Close profile dropdown if clicking outside
      if (showProfileMenu && event.target instanceof Element && !event.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMounted, showProfileMenu]);

  useEffect(() => {
    async function fetchWishlistCount() {
      if (status === "authenticated") {
        try {
          const res = await axios.get("/api/users/wishlistProducts");
          setWishlistCount(res.data.products?.length || 0);
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    }
    fetchWishlistCount();
  }, [status]);

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, categoryId: number) => {
    e.stopPropagation();
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowProfileMenu(false);
    await signOut({ redirect: false });
  };
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="block lg:hidden">
              <button className="text-black focus:outline-none">
                <Menu size={24} />
              </button>
            </div>

            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-extrabold text-black tracking-tighter inline-block">
                UrbanThreadz
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-10">
              {categories.map((category) => (
                <div key={category.id} className="relative group">
                  <Link href={category.path} className="text-gray-800 flex items-center text-sm font-medium uppercase tracking-wide">
                    {category.name}
                    <ChevronDown size={16} className="ml-1" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/search" className="text-gray-700"><Search size={20} /></Link>
              <button
                className="text-gray-700 hover:text-black transition-colors relative"
                onClick={() => {
                  if (status !== "authenticated") {
                    setIsAuthModalOpen(true)
                  } else {
                    window.location.href = "/wishlist"
                  }
                }}
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>
                )}
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="text-gray-700"><User size={20} /></button>
              <Link href="/cart" className="text-gray-700 relative"><ShoppingCart size={20} /></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>

      <div className="container mx-auto px-4">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <div className="flex items-center justify-between h-16">
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:text-gray-600 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-extrabold text-black tracking-tighter inline-block">
              UrbanThreadz
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                <div className="flex items-center">
                  <Link href={category.path} className="text-gray-800 hover:text-black text-sm font-medium transition-colors uppercase tracking-wide">
                    {category.name}
                  </Link>
                  <button
                    className="ml-1 text-gray-800 hover:text-black focus:outline-none"
                    onClick={(e) => toggleDropdown(e, category.id)}
                    aria-label={`Toggle ${category.name} dropdown`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {activeCategory === category.id && (
                  <div
                    className="absolute top-full left-0 w-48 bg-white shadow-lg py-3 mt-1 z-50 border-t-2 border-black"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    {category.subcategories.map((subcategory, idx) => (
                      <Link
                        key={idx}
                        href={`${category.path}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                        onClick={() => setActiveCategory(null)} // Close dropdown after selection
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar and Icons */}
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <div className={`flex items-center ${isSearchExpanded ? 'w-48' : 'w-8'} transition-all duration-300`}>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="text-gray-700 hover:text-black focus:outline-none transition-colors"
                >
                  <Search size={20} />
                </button>
                {isSearchExpanded && (
                  <input
                    type="text"
                    placeholder="Search tees..."
                    className="ml-2 w-full border-b border-gray-300 focus:outline-none focus:border-black text-sm py-1 bg-transparent"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Wishlist */}
            <button
              type="button"
              className="text-gray-700 hover:text-black transition-colors relative"
              onClick={() => {
                if (status === "authenticated") {
                  window.location.href = "/wishlist";
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account - Fixed User Authentication Display */}
            <div className="relative profile-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (status === "authenticated") {
                    setShowProfileMenu(!showProfileMenu);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="text-gray-700 hover:text-black transition-colors flex items-center"
              >
                {status === "authenticated" && session?.user ? (
                  <div className="relative">
                    <Image
                      src={session.user.image || "data:image/jpeg;base64,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"}
                      alt={session.user.name || "User"}
                      className="rounded-full"
                      width={24}
                      height={24}
                    />
                  </div>
                ) : (
                  <User size={20} />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && status === "authenticated" && session?.user && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session.user.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-gray-700 hover:text-black transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">3</span>
            </button>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </div>
      </div>

      {/* Mobile Menu - Black and white theme */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Find your perfect tee..."
                className="w-full border border-gray-200 rounded-none pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
          <div className="border-t border-gray-100">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <Link
                    href={category.path}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase"
                  >
                    {category.name}
                  </Link>
                  <button
                    className="text-gray-700 hover:text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategory(activeCategory === category.id ? null : category.id);
                    }}
                    aria-label={`Toggle ${category.name} dropdown`}
                  >
                    <ChevronDown size={16} className={`transform transition-transform ${activeCategory === category.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {activeCategory === category.id && (
                  <div className="bg-gray-50 pl-8 py-1">
                    {category.subcategories.map((subcategory, idx) => (
                      <Link
                        key={idx}
                        href={`${category.path}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-black"
                        onClick={() => {
                          setActiveCategory(null);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 py-4 px-4 flex items-center space-x-6">
            <button
              type="button"
              className="text-gray-700 hover:text-black transition-colors relative"
              onClick={() => {
                if (status === "authenticated") {
                  window.location.href = "/wishlist";
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account - Mobile Menu Fix */}
            <div className="relative profile-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (status === "authenticated" && session?.user) {
                    setShowProfileMenu(!showProfileMenu);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="text-gray-700 hover:text-black transition-colors"
              >
                {status === "authenticated" && session?.user ? (
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt={session.user.name || "User"}
                    className="rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <User size={20} />
                )}
              </button>

              {/* Mobile Profile Dropdown */}
              {showProfileMenu && status === "authenticated" && session?.user && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{session.user.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Your Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-gray-700 hover:text-black transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                3
              </span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}