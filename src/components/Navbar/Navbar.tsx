import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="h-[64px] sticky top-0 z-50 flex justify-center border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all">
      <div className="flex justify-between items-center w-full max-w-7xl px-4 md:px-6 h-full">
        
        {/* Left Side: Logo */}
        <div className="flex items-center flex-1">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-xl tracking-tighter text-text-main group-hover:opacity-80 transition-opacity">
              CityVoice<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Search (Placeholder for aesthetics) */}
        <div className="hidden md:flex items-center justify-center flex-[2]">
          <div className="relative w-full max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-muted group-focus-within:text-primary transition-colors">🔍</span>
            </div>
            <input 
              type="text" 
              placeholder="Search issues, divisions..." 
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-full py-2 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center justify-end flex-1 gap-4">
          <Link 
            href="/dashboard" 
            className="hidden sm:flex items-center justify-center px-4 py-2 text-sm font-medium text-text-main bg-white/[0.03] border border-white/[0.05] rounded-full hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Dashboard
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <div className="w-full h-full bg-bg-main rounded-full border border-black/50 flex items-center justify-center">
              <span className="text-xs font-bold text-white">CV</span>
            </div>
          </div>
        </div>
        
      </div>
    </nav>
  );
}
