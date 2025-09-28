import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddItemForm from "../components/AddItem";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import logo from "../assets/img/aclcLogo.webp";
import { FaTrash } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { useDeleteItemMutation } from "../query/delete/useDeleteItemMutation";
import type { TItemList } from "../types/types";
import { useAllItemsQuery } from "../query/get/useAllItemsQuery";

export default function InventoryList() {
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);
  const [searchItem, setSearchItem] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [items, setItems] = useState<TItemList[]>([
    {
      id: 1,
      datetime: "2025-09-19T09:00:00",
      SerialNumber: "PRJ-001",
      image: logo,
      ItemName: "Projector",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "X100",
      ItemMake: "Epson",
      Description: "High quality projector",
      Category: "Electronics",
      Condition: "New",
    },
    {
      id: 2,
      datetime: "2025-09-18T10:30:00",
      SerialNumber: "LTP-002",
      image: logo,
      ItemName: "Laptop",
      Image: null,
      ItemType: "Computers",
      ItemModel: "Latitude",
      ItemMake: "Dell",
      Description: "Business laptop",
      Category: "Computers",
      Condition: "Used",
    },
    {
      id: 3,
      datetime: "2025-09-17T14:15:00",
      SerialNumber: "HDMI-003",
      image: logo,
      ItemName: "HDMI Cable",
      Image: null,
      ItemType: "Accessories",
      ItemModel: "UltraHD",
      ItemMake: "Sony",
      Description: "High speed HDMI cable",
      Category: "Accessories",
      Condition: "Refurbished",
    },
    {
      id: 4,
      datetime: "2025-09-16T08:45:00",
      SerialNumber: "MSE-004",
      image: logo,
      ItemName: "Mouse",
      Image: null,
      ItemType: "Accessories",
      ItemModel: "Wireless",
      ItemMake: "Logitech",
      Description: "Wireless mouse",
      Category: "Accessories",
      Condition: "New",
    },
    {
      id: 5,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 6,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 7,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 8,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 9,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 10,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 11,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
    {
      id: 12,
      datetime: "2025-09-15T11:20:00",
      SerialNumber: "MON-005",
      Category: "Electronics",
      image: logo,
      ItemName: "Monitor",
      Image: null,
      ItemType: "Electronics",
      ItemModel: "UltraWide",
      ItemMake: "Samsung",
      Description: "UltraWide monitor",
      Condition: "Used",
    },
  ]);

  // Filter items based on search input
  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.ItemName.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.SerialNumber.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.Category.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.ItemType.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.Condition.toLowerCase().includes(searchItem.toLowerCase())
      ),
    [items, searchItem]
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const validCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () =>
      filteredItems.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage
      ),
    [filteredItems]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchItem]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const { data, isPending } = useQuery(useAllItemsQuery());
  const { mutate } = useDeleteItemMutation();

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  if (isPending) {
    return <InventoryListSkeletonLoader />;
  }

  return (
    // Inventory List Page Container
    <div className="animate-fadeIn inventory-list-container min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
      <header className="inventory-header pt-8 px-8 pb-8 bg-white/80 shadow-lg rounded-b-3xl flex flex-col items-center">
        <h1 className="text-[#1e293b] text-5xl mb-2 font-extrabold tracking-tight drop-shadow-lg">
          Inventory List
        </h1>
        <p className="text-[#64748b] text-lg font-medium max-w-2xl text-center">
          Overview of assets and availability. Track counts by category, staff
          status, and items currently borrowed.
        </p>
      </header>

      {/* Inventory Stats Grid */}
      <section className="inventory-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 pt-6 pb-8">
        {/* Total Items Count */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">
            Total Items
          </span>
          <span className="text-4xl font-bold text-[#2563eb]">
            {items.length}
          </span>
        </div>
        {/* Category Items Count */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">
            Categories
          </span>
          <span className="text-4xl font-bold text-[#2563eb]">3</span>
        </div>
        {/* Status Staff */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">
            Available
          </span>
          <span className="text-4xl font-bold text-[#22c55e]">91</span>
        </div>
        {/* Items Borrow */}
        <div className="bg-white/90 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]">
          <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">
            In Use
          </span>
          <span className="text-4xl font-bold text-[#f59e42]">9</span>
        </div>
      </section>

      {/* Inventory Items Table */}
      <section className="px-8">
        <div className="bg-white/90 h-[55vh] py-4 px-4 rounded-3xl shadow-2xl border border-[#e0e7ef] overflow-x-auto">
          <section className="mb-4 flex justify-between">
            <div className="">
              <Button onClick={() => setIsAddItemFormOpen(true)} />
            </div>
            <div className="flex flex-row gap-2">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 -mt-6">
                  <button
                    className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
                    onClick={() => handlePageChange(validCurrentPage - 1)}
                    disabled={validCurrentPage === 1}
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      className={`px-4 py-3 rounded font-semibold ${
                        validCurrentPage === idx + 1
                          ? "bg-[#2563eb] text-white"
                          : "bg-[#e0e7ef] text-[#2563eb]"
                      }`}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
                    onClick={() => handlePageChange(validCurrentPage + 1)}
                    disabled={validCurrentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              <SearchBar
                onChangeValue={(value) => setSearchItem(value)}
                name={"search"}
                placeholder={"Search your items..."}
              />
            </div>
          </section>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="sticky -top-4 bg-[#f8fafc]">
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Serial Num
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Image
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Name
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Type
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Category
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Condition
                </th>
                <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[#64748b] font-semibold"
                  >
                    No items found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.SerialNumber}
                    className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                  >
                    <td className="py-3 px-4 font-semibold">
                      {item.SerialNumber}
                    </td>
                    <td className="py-3 px-4">
                      <img
                        src={typeof item.image === "string" ? item.image : logo}
                        alt={item.ItemName}
                        className="w-10 h-10 rounded-xl"
                      />
                    </td>
                    <td className="py-3 px-4">{item.ItemName}</td>
                    <td className="py-3 px-4">{item.ItemType}</td>
                    <td className="py-3 px-4">{item.Category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.Condition === "New"
                            ? "bg-green-100 text-green-700"
                            : item.Condition === "Used"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.Condition === "Refurbished"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.Condition}
                      </span>
                    </td>
                    <td className="py-3 pr-6 flex flex-row gap-4">
                      <Link
                        to={`/items/${item.SerialNumber}`}
                        className="px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
                      >
                        View
                      </Link>
                      {/* <button className="px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150">
                      <FaEdit />
                    </button> */}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this item?"
                            )
                          ) {
                            mutate(item.SerialNumber);
                            console.log("Delete item:", item.SerialNumber);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {isAddItemFormOpen && (
        <AddItemForm onClose={() => setIsAddItemFormOpen(false)} />
      )}
    </div>
  );
}
