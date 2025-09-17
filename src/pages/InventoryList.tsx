export default function InventoryList() {
  return (
    // Inventory List Page Container
    <div className="animate-fadeIn inventory-list-container min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
      <header className="inventory-header pt-16 px-8 pb-8 bg-white/80 shadow-lg rounded-b-3xl flex flex-col items-center">
        <h1 className="text-[#1e293b] text-5xl mb-2 font-extrabold tracking-tight drop-shadow-lg">Inventory List</h1>
        <p className="text-[#64748b] text-lg font-medium max-w-2xl text-center">
          Overview of assets and availability. Track counts by category, staff status, and items currently borrowed.
        </p>
      </header>

      {/* Inventory Stats Grid */}
      <section className="inventory-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 pt-12 pb-8">
        {/* Total Items Count */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">Total Items</span>
          <span className="text-4xl font-bold text-[#2563eb]">100</span>
        </div>
        {/* Category Items Count */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">Categories</span>
          <span className="text-4xl font-bold text-[#2563eb]">10</span>
        </div>
        {/* Status Staff */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">Available</span>
          <span className="text-4xl font-bold text-[#22c55e]">233</span>
        </div>
        {/* Items Borrow */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">In Use</span>
          <span className="text-4xl font-bold text-[#f59e42]">5</span>
        </div>
      </section>

      {/* Items Available by Category Section */}
      <section className="inventory-category-available px-8 py-10 bg-white/80 mx-8 mb-8 rounded-3xl shadow-xl flex flex-col justify-evenly border border-[#e0e7ef]">
        <h2 className="text-3xl mb-8 font-extrabold text-[#1e293b] text-center tracking-tight relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-[#2563eb] after:to-[#38bdf8]">
          Items Available by Category
        </h2>
        <div className="category-available-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="available-card rounded-2xl bg-gradient-to-br from-[#e0e7ef] to-[#fff] shadow-lg p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#c7d2fe]">
            <span className="available-title font-semibold text-lg text-[#2563eb] mb-2">Cables</span>
            <span className="available-value font-bold text-2xl text-[#1e293b]">100</span>
          </div>
          <div className="available-card rounded-2xl bg-gradient-to-br from-[#e0e7ef] to-[#fff] shadow-lg p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#c7d2fe]">
            <span className="available-title font-semibold text-lg text-[#2563eb] mb-2">Adapters</span>
            <span className="available-value font-bold text-2xl text-[#1e293b]">22</span>
          </div>
          <div className="available-card rounded-2xl bg-gradient-to-br from-[#e0e7ef] to-[#fff] shadow-lg p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#c7d2fe]">
            <span className="available-title font-semibold text-lg text-[#2563eb] mb-2">Peripherals</span>
            <span className="available-value font-bold text-2xl text-[#1e293b]">45</span>
          </div>
          <div className="available-card rounded-2xl bg-gradient-to-br from-[#e0e7ef] to-[#fff] shadow-lg p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#c7d2fe]">
            <span className="available-title font-semibold text-lg text-[#2563eb] mb-2">Networking</span>
            <span className="available-value font-bold text-2xl text-[#1e293b]">12</span>
          </div>
          <div className="available-card rounded-2xl bg-gradient-to-br from-[#e0e7ef] to-[#fff] shadow-lg p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#c7d2fe]">
            <span className="available-title font-semibold text-lg text-[#2563eb] mb-2">Others</span>
            <span className="available-value font-bold text-2xl text-[#1e293b]">8</span>
          </div>
        </div>
      </section>
    </div>
  )
}
