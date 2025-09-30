import { useEffect, useMemo, useState } from "react";
import AddItemForm from "../components/AddItem";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import logo from "../assets/img/aclcLogo.webp";
import { useQuery } from "@tanstack/react-query";
import { useDeleteItemMutation } from "../query/delete/useDeleteItemMutation";
import type { TItemList } from "../types/types";
import { useAllItemsQuery } from "../query/get/useAllItemsQuery";
import InventoryBadges from "../components/InventoryBadges";
import Pagination from "../components/Pagination";
import InventoryTable from "../components/InventoryTable";
import ErrorTable from "../components/ErrorTables";

const badges = [
  { name: "Total Items", total: 123 },
  { name: "Categories", total: 192 },
  { name: "Available", total: 123 },
  { name: "In Use", total: 442 },
];

export default function InventoryList() {
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);
  const [searchItem, setSearchItem] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [items, setItems] = useState<TItemList[]>([]);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category.toLowerCase().includes(searchItem.toLowerCase()),
      ),
    [items, searchItem],
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const validCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () =>
      filteredItems.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage,
      ),
    [filteredItems, itemsPerPage, validCurrentPage],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const { data, isPending, isError } = useQuery(useAllItemsQuery());
  const { mutate } = useDeleteItemMutation();

  useEffect(() => {
    if (!data) return;
    setItems(data);
  }, [data]);

  if (isPending) {
    return <InventoryListSkeletonLoader />;
  }

  return (
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

      {/* Inventory Stats */}
      <section className="inventory-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 pt-6 pb-8">
        {badges.map((item) => (
          <div key={item.name}>
            <InventoryBadges
              name={item.name}
              total={isError ? 0 : item.total}
            />
          </div>
        ))}
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
                /*Pagination Component */
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  handlePageChange={handlePageChange}
                />
              )}
              {/* Search Bar Component */}
              <SearchBar
                onChangeValue={(value) => setSearchItem(value)}
                name={"search"}
                placeholder={"Search your items..."}
              />
            </div>
          </section>
          <div className="h-[40vh] overflow-x-auto rounded-xl shadow-inner bg-white/95">
            {isError ? (
              <ErrorTable />
            ) : (
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
                      DateTime
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
                        key={item.serialNumber}
                        className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                      >
                        <InventoryTable
                          createdAt={item.createdAt}
                          ItemName={item.itemName}
                          SerialNumber={item.serialNumber}
                          Image={item.image || logo}
                          ItemType={item.itemType}
                          Category={item.category}
                          Condition={item.condition}
                          onMutate={(Id) => mutate(Id)}
                        />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
      {isAddItemFormOpen && (
        <AddItemForm onClose={() => setIsAddItemFormOpen(false)} />
      )}
    </div>
  );
}
