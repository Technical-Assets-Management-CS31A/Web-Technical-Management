import { useArchivesQuery } from "../query/get/useArchivesQuery.ts";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import ArchiveSkeletonLoader from "../loader/ArchiveSkeletonLoader.tsx";
import type { TArchiveItem } from "../types/types.ts";
import { useRestoreItemMutation } from "../query/delete/useRestoreItemMutation.ts";
import ErrorTable from "../components/ErrorTables.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Pagination from "../components/Pagination.tsx";
import ArchiveTableRow from "../components/ArchiveTable.tsx";

export default function Archive() {
  const [archiveItems, setArchiveItems] = useState<TArchiveItem[]>([]);
  const [searchItem, setSearchItem] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<"items" | "users">("items");
  const itemsPerPage = 5;

  const { data, isPending, isError } = useQuery(useArchivesQuery());
  const restoreMutation = useRestoreItemMutation();

  // Filter items based on search term and category
  const filteredItems = useMemo(
    () =>
      archiveItems.filter((item) => {
        const matchesSearch =
          item.itemName.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.serialNumber.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.itemType.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.itemModel.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.itemMake.toLowerCase().includes(searchItem.toLowerCase());

        const matchesCategory =
          selectedCategory === "" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [archiveItems, searchItem, selectedCategory],
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Ensure current page is valid
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

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);


  // Handle showing all items
  const handleShowAll = useCallback(() => {
    setSelectedCategory("");
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (data) setArchiveItems(data);
  }, [data]);

  const handleRestore = (id: string) => {
    if (window.confirm("Are you sure you want to restore this item?")) {
      restoreMutation.mutate(id, {
        onSuccess: () => {
          window.location.reload();
        }
      });
    }
  };

  if (isPending) {
    return <ArchiveSkeletonLoader />;
  }

  return (
    <div className="animate-fadeIn archive-list-container min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
      <header className="archive-header pt-8 px-8 pb-8 bg-white/80 shadow-md flex flex-col items-center z-50">
        <h1 className="text-[#1e293b] text-5xl mb-2 font-extrabold tracking-tight drop-shadow-lg">
          Archived {activeFilter === "items" ? "Items" : "Users"}
        </h1>
        <p className="text-[#64748b] text-lg font-medium max-w-2xl text-center mb-6">
          Manage archived {activeFilter === "items" ? "items" : "users"} and restore them if needed. View all previously archived {activeFilter === "items" ? "assets" : "accounts"}.
        </p>
      </header>

      {/* Filter Buttons */}
      {isError ? "" : (
        <div className="flex gap-4 mb-2 mt-4 ml-10">
          <button
            onClick={() => {
              setActiveFilter("items");
              setCurrentPage(1);
              setSearchItem("");
              setSelectedCategory("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeFilter === "items"
              ? "bg-gradient-to-r from-[#4f88f9] to-[#38bdf8] text-white shadow-lg scale-105"
              : "bg-white text-[#64748b] border-2 border-[#e0e7ef] hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}
          >
            Items
          </button>
          <button
            onClick={() => {
              setActiveFilter("users");
              setCurrentPage(1);
              setSearchItem("");
              setSelectedCategory("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeFilter === "users"
              ? "bg-gradient-to-r from-[#4f88f9] to-[#38bdf8] text-white shadow-lg scale-105"
              : "bg-white text-[#64748b] border-2 border-[#e0e7ef] hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}
          >
            Users
          </button>
        </div>
      )}

      <div className="h-full overflow-auto mt-8">
        {/* Archived Items/Users Table */}
        <section className="px-8">
          <div className="bg-white/90 h-[55vh] py-4 px-4 rounded-3xl shadow-md border border-[#e0e7ef] overflow-x-auto">
            <section className="mb-4 flex justify-between">
              <div className=""></div>
              <div className="flex flex-row gap-2">
                {/* Pagination Component */}
                {activeFilter === "items" && filteredItems.length > 0 && (
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                    selectedCategory={selectedCategory}
                    handleShowAll={handleShowAll}
                  />
                )}
                {/* Search Bar Component */}
                <SearchBar
                  onChangeValue={(value) => setSearchItem(value)}
                  name="search"
                  placeholder={`Search archived ${activeFilter}...`}
                />
              </div>
            </section>
            <div className="h-[40vh] overflow-x-auto rounded-md shadow-inner bg-white/95">
              {/* Check if the response from the QUERY is error cause for internet connection etc, will return a ERROR TABLE COMPONENTS */}
              {isError ? (
                <ErrorTable />
              ) : activeFilter === "items" ? (
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
                        Model
                      </th>
                      <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                        Make
                      </th>
                      <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                        Description
                      </th>
                      <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                        Category
                      </th>
                      <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                        Condition
                      </th>
                      <th className="bg-[#f8fafc]font-semibold py-4 px-4 border-b border-[#e6e6e6] text-[#2563eb]">
                        Bar Code
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
                    {/* Check if the paginated item is equal to ZERO  */}
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="text-center py-10 text-red-400 font-semibold text-xl"
                        >
                          {archiveItems.length === 0
                            ? <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="text-6xl mb-4 text-[#64748b]">👥</div>
                                <h3 className="text-2xl font-semibold text-[#1e293b] mb-2">
                                  No Archived Items
                                </h3>
                                <p className="text-[#64748b] text-lg max-w-md">
                                  Currently, there are no archived items in the system. When items are archived, they will appear here.
                                </p>
                              </div>
                            </div>
                            : "No items match your search criteria"}
                        </td>
                      </tr>
                    ) : (
                      // Mapping all the archived items
                      paginatedData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc] cursor-pointer"
                        >
                          <ArchiveTableRow
                            id={item.id}
                            archivedAt={item.archivedAt}
                            itemName={item.itemName}
                            serialNumber={item.serialNumber}
                            image={item.image}
                            itemType={item.itemType}
                            itemModel={item.itemModel}
                            itemMake={item.itemMake}
                            description={item.description}
                            category={item.category}
                            condition={item.condition}
                            barCode={item.barCode}
                            onRestore={handleRestore}
                            isRestoring={restoreMutation.isPending}
                          />
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                // Users table placeholder
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-[#64748b]">👥</div>
                    <h3 className="text-2xl font-semibold text-[#1e293b] mb-2">
                      No Archived Users
                    </h3>
                    <p className="text-[#64748b] text-lg max-w-md">
                      Currently, there are no archived users in the system. When users are archived, they will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
