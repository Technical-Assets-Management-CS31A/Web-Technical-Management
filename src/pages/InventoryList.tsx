import { useCallback, useEffect, useMemo, useState } from "react";
import AddItemForm from "../components/AddItem";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import InventoryListSkeletonLoader from "../loader/InventoryListSkeletonLoader";
import logo from "../assets/img/aclcLogo.webp";
import { useQuery } from "@tanstack/react-query";
import { useDeleteItemMutation } from "../query/delete/useDeleteItemMutation";
import type { TItemList } from "../types/types";
import { useAllItemsQuery } from "../query/get/useAllItemsQuery";
import { InventoryBadges } from "../components/InventoryBadges";
import Pagination from "../components/Pagination";
import InventoryTable from "../components/InventoryTable";
import ErrorTable from "../components/ErrorTables";

export default function InventoryList() {
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);
  const [searchItem, setSearchItem] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [items, setItems] = useState<TItemList[]>([]);

  // this func use a useMemo to filtered item either its itemName or the Category and also for the Matches Category and return items,searchItem and selectedCategory
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          item.itemName.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category.toLowerCase().includes(searchItem.toLowerCase());

        const matchesCategory =
          selectedCategory === "" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [items, searchItem, selectedCategory],
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // check if the validCurrentPage is greater than ZERO then it will return the smaller currentPage and the totalPages if the condition is false then it return to ONE
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

  // this func will handle all the page triggered in the button to set either to 1 to 2 or 3 etc
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // this func check if the category is selected is true then it will return all the item matches on this category selected
  const handleCategoryClick = useCallback(
    (category: string) => {
      setSelectedCategory(selectedCategory === category ? "" : category);
      setCurrentPage(1);
    },
    [selectedCategory],
  );

  // this func return to display all the items when the selectedCategory is executed
  const handleShowAll = useCallback(() => {
    setSelectedCategory("");
    setCurrentPage(1);
  }, []);

  // get the response from useQuery
  const { data, isPending, isError } = useQuery(useAllItemsQuery());
  // this mutate func will return the ID of the item and to to deleted
  const { mutate } = useDeleteItemMutation();

  // this Effect will automatically updated the data of the items response
  useEffect(() => {
    if (!data) return;
    setItems(data);
  }, [data]);

  if (isPending) {
    return <InventoryListSkeletonLoader />;
  }

  return (
    <div className="animate-fadeIn inventory-list-container min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col">
      <header className="inventory-header pt-8 px-8 pb-8 bg-white/80 shadow-md  flex flex-col items-center z-50">
        <h1 className="text-[#1e293b] text-5xl mb-2 font-extrabold tracking-tight drop-shadow-lg">
          Inventory List
        </h1>
        <p className="text-[#64748b] text-lg font-medium max-w-2xl text-center">
          Overview of assets and availability. Track counts by category, staff
          status, and items currently borrowed.
        </p>
      </header>

      <div className="h-full overflow-auto">
        {/* Inventory Stats */}
        <section className="scrollbar-none w-[100rem] mx-auto flex flex-row gap-4 py-8 overflow-x-scroll">
          {Array.from(new Set(items.map((item) => item.category))).map(
            (category) => {
              const itemsInCategory = items.filter(
                (item) => item.category === category,
              );
              return (
                <InventoryBadges
                  key={category}
                  name={category}
                  total={itemsInCategory.length}
                  onClick={() => handleCategoryClick(category)}
                  isSelected={selectedCategory === category}
                />
              );
            },
          )}
        </section>

        {/* Inventory Items Table */}
        <section className="px-8">
          <div className="bg-white/90 h-[55vh] py-4 px-4 rounded-3xl shadow-md border border-[#e0e7ef] overflow-x-auto">
            <section className="mb-4 flex justify-between">
              <div className="">
                <Button
                  onClick={() => setIsAddItemFormOpen(true)}
                  name={"New Item"}
                />
              </div>
              <div className="flex flex-row gap-2">
                {/*Pagination Component*/}
                {filteredItems.length > 0 && (
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
                  name={"search"}
                  placeholder={"Search your items..."}
                />
              </div>
            </section>
            <div className="h-[40vh] overflow-x-auto rounded-md shadow-inner bg-white/95">
              {/* Check if the response from the QUERY is error cause for internet connection etc, will return a ERROR TABLE COMPONENTS */}
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
                    {/* Check if the paginated item is equal to ZERO  */}
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center py-10 text-red-400 font-semibold text-xl"
                        >
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      // Mapping all the items created
                      paginatedData.map((item) => (
                        <tr
                          key={item.serialNumber}
                          className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc] cursor-pointer"
                        >
                          <InventoryTable
                            id={item.id}
                            createdAt={item.createdAt}
                            ItemName={item.itemName}
                            SerialNumber={item.serialNumber}
                            Image={item.image || logo}
                            ItemType={item.itemType}
                            Category={item.category}
                            Condition={item.condition}
                            onMutate={() => mutate(item.id)}
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
      </div>

      {/* Check if the add item form is true then it will show */}
      {isAddItemFormOpen && (
        <AddItemForm onClose={() => setIsAddItemFormOpen(false)} />
      )}
    </div>
  );
}
