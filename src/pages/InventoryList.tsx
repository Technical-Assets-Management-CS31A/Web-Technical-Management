import "../../public/css/inventorylist.css"

export default function InventoryList() {
  return (
    <div className="inventory-list-container">
      <header className="inventory-header">
        <h1>Inventory List</h1>
        <p>
          Overview of assets and availability. Track counts by category, staff status,
          and items currently borrowed.
        </p>
      </header>

      <section className="inventory-stats-grid">
        <div className="stat-card">
          <span className="stat-title">Count All Items</span>
          <span className="stat-value">100</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Category Items Count</span>
          <span className="stat-value">10</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Status Staff</span>
          <span className="stat-value">Active</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Items Borrow</span>
          <span className="stat-value">5</span>
        </div>
      </section>

      <section className="inventory-category-available">
        <h2>Items Available by Category</h2>
        <div className="category-available-grid">
          <div className="available-card">
            <span className="available-title">Cables</span>
            <span className="available-value">100</span>
          </div>
          <div className="available-card">
            <span className="available-title">Adapters</span>
            <span className="available-value">22</span>
          </div>
          <div className="available-card">
            <span className="available-title">Peripherals</span>
            <span className="available-value">45</span>
          </div>
          <div className="available-card">
            <span className="available-title">Networking</span>
            <span className="available-value">12</span>
          </div>
        </div>
      </section>
    </div>
  )
}
