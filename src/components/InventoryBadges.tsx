type InventoryBadgesProps = {
  name: string;
  total: number;
  onClick?: () => void;
  isSelected?: boolean;
};

export default function InventoryBadges({ name, total, onClick, isSelected = false }: InventoryBadgesProps) {
  return (
    <>
      <div
        key={name}
        onClick={onClick}
        className={`bg-white/90 shadow-xl rounded-2xl p-4 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border cursor-pointer ${isSelected
          ? 'border-[#2563eb] bg-blue-50/90 shadow-blue-200'
          : 'border-[#e0e7ef] hover:border-[#2563eb]'
          }`}
      >
        <span className={`stat-title font-semibold text-lg mb-2 ${isSelected ? 'text-[#2563eb]' : 'text-[#64748b]'
          }`}>
          {name}
        </span>
        <span className={`text-4xl font-bold ${isSelected ? 'text-[#1d4ed8]' : 'text-[#2563eb]'
          }`}>{total}</span>
      </div>
    </>
  );
}
