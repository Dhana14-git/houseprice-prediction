export default function TopAppBar() {
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#344865] bg-[#111821]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-blue-500 text-3xl">📊</span>
          <h1 className="text-lg font-bold">Beijing ML Dashboard</h1>
        </div>
  
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-green-400 uppercase">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Engine Online
          </span>
          <span className="text-xl cursor-pointer">⚙️</span>
        </div>
      </header>
    );
  }
  