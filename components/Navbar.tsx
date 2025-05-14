"use client";

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/ui/AuthModal';
import { useSession, signOut } from 'next-auth/react'; // Removed incorrect 'user' import
import Image from 'next/image';


export default function TshirtEcomNavbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Client-side state - using null as initial state before hydration
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // This will handle client-side hydration
  const [isMounted, setIsMounted] = useState(false);

  // Simplified categories for t-shirt store
  const categories = [
    { id: 1, name: 'New Arrivals', subcategories: ['This Week', 'This Month', 'Trending'], path: '/new-arrivals' },
    { id: 2, name: 'Collections', subcategories: ['Graphic Tees', 'Minimalist', 'Vintage', 'Limited Edition'], path: '/collections' },
    { id: 3, name: 'Shop By', subcategories: ['Men', 'Women', 'Unisex'], path: '/shop-by' },
    { id: 4, name: 'Sale', subcategories: ['Clearance', 'Bundle Deals'], path: '/sale' },
  ];
  
  // Proper session usage
  const { data: session, status } = useSession();
  
  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle scroll effect - only run on client side
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

  // Toggle dropdown without stopping propagation for Link
  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, categoryId: number) => {
    e.stopPropagation(); // Stop propagation only for the dropdown toggle
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };
  
  // Handle sign out function
  const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowProfileMenu(false);
    await signOut({ redirect: false });
    // You could add additional actions after signout here
  };

  // If not mounted yet (server-side), render a simpler version to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        {/* Top Bar - Announcement/Promotion with black background */}
        <div className="bg-black text-white text-center py-2 px-4 text-xs font-medium tracking-wider">
          FREE SHIPPING ON ALL ORDERS | Use code <span className="font-bold">TEEBLACK</span> for 20% OFF
        </div>

        {/* Basic navbar structure for SSR */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button Placeholder */}
            <div className="block lg:hidden">
              <button className="text-black focus:outline-none">
                <Menu size={24} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-extrabold text-black tracking-tighter inline-block">
                UrbanThreadz
              </Link>
            </div>

            {/* Desktop Nav Placeholder */}
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

            {/* Icons Placeholder */}
            <div className="flex items-center space-x-6">
              <Link href="/search" className="text-gray-700"><Search size={20} /></Link>
              <Link href="/wishlist" className="text-gray-700 relative"><Heart size={20} /></Link>
              <button onClick={() => setIsAuthModalOpen(true)} className="text-gray-700"><User size={20} /></button>
              <Link href="/cart" className="text-gray-700 relative"><ShoppingCart size={20} /></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client-side fully interactive component once mounted
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      {/* Top Bar - Announcement/Promotion with black background */}
      <div className="bg-black text-white text-center py-2 px-4 text-xs font-medium tracking-wider">
        FREE SHIPPING ON ALL ORDERS | Use code <span className="font-bold">TEEBLACK</span> for 20% OFF
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:text-gray-600 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-extrabold text-black tracking-tighter inline-block">
              UrbanThreadz
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-10">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                {/* Main category link and dropdown button separated */}
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

                {/* Dropdown menu */}
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
            <Link href="/wishlist" className="text-gray-700 hover:text-black transition-colors relative">
              <Heart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
            </Link>

            {/* Account - Fixed User Authentication Display */}
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
                className="text-gray-700 hover:text-black transition-colors flex items-center"
              >
                {status === "authenticated" && session?.user ? (
                  <div className="relative">
                    <Image
                      src={session.user.image || "/default-avatar.png"}
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
            <Link href="/cart" className="text-gray-700 hover:text-black transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">3</span>
            </Link>
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
            <Link href="/wishlist" className="text-gray-700 hover:text-black transition-colors relative">
              <Heart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </Link>

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
            <Link href="/cart" className="text-gray-700 hover:text-black transition-colors relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                3
              </span>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}