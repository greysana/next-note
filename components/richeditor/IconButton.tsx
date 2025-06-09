import { IconButtonProps } from "../../types/editor";

export const IconButton = ({
  onClick,
  isActive = false,
  icon: Icon,
  title,
  className = "",
}: IconButtonProps) => (
  <button
    onClick={onClick}
    className={`p-2 cursor-pointer rounded hover:bg-gray-100 ${
      isActive ? "bg-gray-200" : ""
    } ${className}`}
    title={title}
    type="button"
  >
    <Icon size={16} />
  </button>
);