import { FaPlus } from "react-icons/fa6";

interface CloseButtonProps {
    onClick: () => void;
}

export default function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <FaPlus data-testid="closebutton" onClick={onClick} className="transform rotate-45 transition-all duration-200 text-2xl text-gray-400 cursor-pointer w-[32px] h-[32px] items-center justify-center rounded-full hover:text-white hover:bg-red-500 hover:rotate-180" />
    )
}
