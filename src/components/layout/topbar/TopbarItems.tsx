import Image from "next/image";
import { FiBell, FiSettings, FiHelpCircle } from "react-icons/fi";

export const TopbarItems = [
  {
    element: (
      <button className="relative hover:text-white transition">
        <FiBell size={20} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
          3
        </span>
      </button>
    ),
  },
  {
    element: (
      <button className="hover:text-white transition">
        <FiSettings size={20} />
      </button>
    ),
  },
  {
    element: (
      <button className="hover:text-white transition">
        <FiHelpCircle size={20} />
      </button>
    ),
  },
];
