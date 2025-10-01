import { Link } from "react-router-dom";

type BadgesProps = {
  name: string;
  link: string;
  data: number;
};

export default function DashboardBadges({ name, link, data}: BadgesProps) {
  return (
    <Link
      key={name}
      to={link}
      className="flex flex-col bg-white/90 shadow-xl rounded-2xl p-8 items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]"
    >
      <h2 className="font-semibold text-lg text-[#64748b] mb-2">{name}</h2>
      <p className="text-4xl font-bold text-[#2563eb]">{data}</p>
    </Link>
  );
}
