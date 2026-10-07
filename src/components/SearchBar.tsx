import { FaSearch } from "react-icons/fa";

type SearchProps = {
  onChangeValue: (value: string) => void;
  name?: string;
  placeholder?: string;
};

const SearchBar = ({ onChangeValue, name, placeholder }: SearchProps) => {
  return (
    <div className="flex items-center py-2 px-4 w-full sm:w-auto sm:min-w-[280px] rounded-xl shadow-inner bg-slate-100">
      <FaSearch className="mr-3 text-lg text-slate-500 flex-shrink-0" />
      <input
        className="p-1 w-full text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
        type="search"
        name={name}
        placeholder={placeholder}
        onChange={(e) => onChangeValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
