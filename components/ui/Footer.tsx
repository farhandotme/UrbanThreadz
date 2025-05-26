import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-50 border-t border-blue-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Footer Info & Address */}
        <div className="flex flex-col md:flex-row gap-8 w-full md:justify-between md:items-start">
          {/* About/Brand */}
          <div className="flex-1 mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded" />
              <span className="text-xl font-extrabold text-black tracking-tighter">UrbanThreadz</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              UrbanThreadz brings you the latest in streetwear and casual fashion. Quality, comfort, and style—delivered to your doorstep.
            </p>
          </div>
          {/* Address & Contact */}
          <div className="flex-1 mb-6 md:mb-0">
            <h4 className="text-base font-semibold text-black mb-2">Contact Us</h4>
            <p className="text-gray-700 text-sm">123 Fashion Ave, Suite 101<br />New York, NY 10001</p>
            <p className="text-gray-700 text-sm mt-1">Email: <a href="mailto:support@urbanthreadz.com" className="text-black hover:underline">support@urbanthreadz.com</a></p>
            <p className="text-gray-700 text-sm">Phone: <a href="tel:+1234567890" className="text-black hover:underline">+1 234 567 890</a></p>
          </div>
          {/* Quick Links */}
          <div className="flex-1">
            <h4 className="text-base font-semibold text-black mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/about" className="text-gray-700 hover:text-black transition">About Us</Link></li>
              <li><Link href="/faq" className="text-gray-700 hover:text-black transition">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-700 hover:text-black transition">Contact</Link></li>
              <li><Link href="/returns" className="text-gray-700 hover:text-black transition">Returns & Exchanges</Link></li>
              <li><Link href="/privacy" className="text-gray-700 hover:text-black transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        {/* Social Icons */}
        <div className="flex gap-4 mt-8 justify-center md:justify-end w-full">
          <a href="#" aria-label="Instagram" className="hover:text-black transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-black transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1s-4.18 1.64-6.29 2.34A4.48 4.48 0 0 0 3 7.48c0 .35.04.7.1 1.03A12.94 12.94 0 0 1 1.67 3.15s-.4 1.18-.4 2.36c0 1.64.84 3.09 2.13 3.94A4.52 4.52 0 0 1 2 8.13v.06a4.48 4.48 0 0 0 3.6 4.4c-.2.05-.41.08-.63.08-.15 0-.3-.01-.45-.04a4.48 4.48 0 0 0 4.19 3.12A9 9 0 0 1 1 19.54a12.94 12.94 0 0 0 7 2.05c8.39 0 12.98-6.95 12.98-12.98 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 23 3z"/></svg>
          </a>
          <a href="#" aria-label="Facebook" className="hover:text-black transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z"/></svg>
          </a>
        </div>
      </div>
      <div className="text-center text-gray-400 text-sm py-4 border-t border-blue-100">
        &copy; {new Date().getFullYear()} UrbanThreadz. All rights reserved.
      </div>
    </footer>
  );
}
