import { FaPlus } from "react-icons/fa6"


type ButtonProps = {
    onClick?: () => void;
    name?: string;
}


export default function Button({ onClick, name }: ButtonProps) {
    return (
        <button
            className="flex items-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150"
            type="button"
            onClick={onClick}
            data-testid="button"
        >
            <FaPlus /> {name}
        </button>
    )
}
