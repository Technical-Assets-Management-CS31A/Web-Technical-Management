type InventoryBadgesProps = {
  name: string;
  total: number;
};

export default function InventoryBadges({ name, total }: InventoryBadgesProps) {
  return (
    <>
      <div
        key={name}
        className="bg-white/90 shadow-xl rounded-2xl p-4 flex flex-col items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]"
      >
        <span className="stat-title font-semibold text-lg text-[#64748b] mb-2">
          {name}
        </span>
        <span className="text-4xl font-bold text-[#2563eb]">{total}</span>
      </div>
    </>
  );
}
