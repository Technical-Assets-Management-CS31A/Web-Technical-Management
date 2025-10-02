type PaginationProps = {
  totalPages: number;
  currentPage: number;
  handlePageChange: (value: number) => void;
  selectedCategory?: string;
  handleShowAll?: () => void;
};

export default function Pagination({
  totalPages,
  currentPage,
  handlePageChange,
  selectedCategory,
  handleShowAll,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-2 -mt-6">
      {/* Reset back to all items Button */}
      {selectedCategory && selectedCategory !== "" && (
        <button
          className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
          onClick={handleShowAll}
        >
          All
        </button>
      )}
      {/* Decreament the Page */}
      <button
        className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {/* Button Pagination this will work if the item greater than 5*/}
      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx + 1}
          className={`px-4 py-3 rounded font-semibold ${currentPage === idx + 1
            ? "bg-[#2563eb] text-white"
            : "bg-[#e0e7ef] text-[#2563eb]"
            }`}
          onClick={() => handlePageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}
      {/* Increament the Page */}
      <button
        className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
