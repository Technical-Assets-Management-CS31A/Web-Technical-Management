import { FaSearch } from "react-icons/fa";

type SearchProps = {
  onChangeValue: (value: string) => void;
  name?: string;
  placeholder?: string;
};

const SearchBar = ({ onChangeValue, name, placeholder }: SearchProps) => {
  return (
    <div className="flex items-center mb-6 w-full max-w-md bg-[#f1f5f9] rounded-xl shadow-inner px-4 py-2">
      <FaSearch className="text-xl text-[#64748b] mr-3" />
      <input
        className="w-full bg-transparent p-1 border-none outline-none text-lg text-[#222] placeholder-[#94a3b8]"
        type="search"
        name={name}
        placeholder={placeholder}
        onChange={(e) => onChangeValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
