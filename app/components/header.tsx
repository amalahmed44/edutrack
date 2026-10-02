"use client";



export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Admin Portal
        </h2>
        <p className="text-xs text-slate-500">
          Education & Graduate Tracking
        </p>
      </div>

 
    </header>
  );
}