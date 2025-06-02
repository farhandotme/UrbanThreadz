"use client";

import AuthModal from '@/components/ui/AuthModal';
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

import Cart from './cart';
import { toast, Toaster } from 'sonner';

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

interface CartItem {
  quantity: number;
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
  const [cartItemCount, setCartItemCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

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

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await axios.get('/api/users/cart');
        const items = response.data as CartItem[];
        setCartItemCount(items.reduce((count: number, item: CartItem) => count + item.quantity, 0));
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };

    if (session) {
      fetchCartCount();
    }
  }, [session]);

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, categoryId: number) => {
    e.stopPropagation();
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowProfileMenu(false);
    await signOut({ redirect: false });
    toast.success('Logged out successfully');
  };
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]">

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="block lg:hidden">
              <button className="text-[var(--foreground)] focus:outline-none">
                <Menu size={24} />
              </button>
            </div>

            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-extrabold text-[var(--foreground)] tracking-tighter inline-block">
                UrbanThreadz
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-10">
              {categories.map((category) => (
                <div key={category.id} className="relative group">
                  <Link href={category.path} className="text-[var(--neutral-foreground)] flex items-center text-sm font-medium uppercase tracking-wide">
                    {category.name}
                    <ChevronDown size={16} className="ml-1" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/search" className="text-[var(--secondary)]"><Search size={20} /></Link>
              <button
                className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors relative"
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
                  <span className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] text-xs rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>
                )}
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="text-[var(--secondary)]"><User size={20} /></button>
              <Link href="/cart" className="text-[var(--secondary)] relative"><ShoppingCart size={20} /></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--background)] shadow-md' : 'bg-[var(--background)]'}`}>

      <div className="container mx-auto px-4">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <div className="flex items-center justify-between h-16">
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[var(--foreground)] hover:text-[var(--secondary)] focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-extrabold text-[var(--foreground)] tracking-tighter inline-block">
              UrbanThreadz
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                <div className="flex items-center">
                  <Link href={category.path} className="text-[var(--neutral-foreground)] hover:text-[var(--foreground)] text-sm font-medium transition-colors uppercase tracking-wide">
                    {category.name}
                  </Link>
                  <button
                    className="ml-1 text-[var(--neutral-foreground)] hover:text-[var(--foreground)] focus:outline-none"
                    onClick={(e) => toggleDropdown(e, category.id)}
                    aria-label={`Toggle ${category.name} dropdown`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {activeCategory === category.id && (
                  <div
                    className="absolute top-full left-0 w-48 bg-[var(--card)] shadow-lg py-3 mt-1 z-50 border-t-2 border-[var(--foreground)]"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    {category.subcategories.map((subcategory, idx) => (
                      <Link
                        key={idx}
                        href={`${category.path}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-5 py-2 text-sm text-[var(--card-foreground)] hover:bg-[var(--neutral)] hover:text-[var(--foreground)] transition-colors"
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
                  className="text-[var(--secondary)] hover:text-[var(--foreground)] focus:outline-none transition-colors"
                >
                  <Search size={20} />
                </button>
                {isSearchExpanded && (
                  <input
                    type="text"
                    placeholder="Search tees..."
                    className="ml-2 w-full border-b border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] text-sm py-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--secondary)]"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-[var(--secondary)] hover:text-[var(--foreground)] focus:outline-none transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors relative"
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
                <span className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
                className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors flex items-center"
              >
                {status === "authenticated" && session?.user ? (
                  <div className="relative">
                    <Image
                      src={session.user.image || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg"}
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
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] shadow-lg rounded-md py-1 z-50 border border-[var(--border)]">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{session.user.name || "User"}</p>
                    <p className="text-xs text-[var(--secondary)] truncate">{session.user.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-[var(--card-foreground)] hover:bg-[var(--neutral)]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-[var(--card-foreground)] hover:bg-[var(--neutral)]"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--neutral)]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </button>
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </div>
      </div>

      {/* Mobile Menu - Black and white theme */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[var(--background)] border-t border-[var(--border)] shadow-lg">
          <div className="px-4 py-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-[var(--secondary)]" />
              <input
                type="text"
                placeholder="Find your perfect tee..."
                className="w-full border border-[var(--border)] rounded-none pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)] bg-transparent text-[var(--foreground)] placeholder:text-[var(--secondary)]"
              />
            </div>
          </div>
          <div className="border-t border-[var(--border)]">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <Link
                    href={category.path}
                    className="text-sm font-medium text-[var(--neutral-foreground)] hover:text-[var(--foreground)] transition-colors uppercase"
                  >
                    {category.name}
                  </Link>
                  <button
                    className="text-[var(--neutral-foreground)] hover:text-[var(--foreground)]"
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
                  <div className="bg-[var(--neutral)] pl-8 py-1">
                    {category.subcategories.map((subcategory, idx) => (
                      <Link
                        key={idx}
                        href={`${category.path}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-[var(--neutral-foreground)] hover:text-[var(--foreground)]"
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
            {/* Theme Toggle Button - Mobile */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false); // Optionally close menu on theme change
              }}
              className="text-[var(--secondary)] hover:text-[var(--foreground)] focus:outline-none transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              type="button"
              className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors relative"
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
                <span className="absolute -top-2 -right-2 bg-[var(--foreground)] text-[var(--background)] text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
                className="text-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
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
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] shadow-lg rounded-md py-1 z-50 border border-[var(--border)]">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--card-foreground)]">{session.user.name || "User"}</p>
                    <p className="text-xs text-[var(--secondary)] truncate">{session.user.email || ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-[var(--card-foreground)] hover:bg-[var(--neutral)]"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-[var(--card-foreground)] hover:bg-[var(--neutral)]"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Your Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[var(--neutral)]"
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
      <Toaster />
    </div>
  );
}