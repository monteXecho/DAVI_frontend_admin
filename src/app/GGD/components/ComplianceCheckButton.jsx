import Icon from "./Icon";
import Spinner from "./Spinner";

export default function ComplianceCheckButton({
  children,
  className = "",
  variant = "normal",
  size = "md",
  icon,
  iconPosition = "left",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed gap-2";
  const sizes = {
    xs: "px-1 py-0.5 text-xs",
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5",
  };
  const variants = {
    normal: "bg-[#23BD92] text-white hover:bg-green-400",
    uploading: "bg-[#CFE4FF] text-[#4C9AFF] hover:bg-blue-300",
    uploaded: "bg-[#D6F5EB] text-[#23BD92] hover:bg-green-300",
    disabled: "bg-[#9DCBBF] text-white hover:bg-green-400",
    remove: "bg-[#F4A7A7] text-white hover:bg-red-400",
  };
  const cls = `${base} ${sizes[size] ?? sizes.md} ${
    variants[variant] ?? variants.primary
  } ${className} transition-all`;

  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <button className={cls} {...props}>
      {variant === "uploading" ? (
        <Spinner className="text-blue-600" size={24} strokeWidth={2} />
      ) : variant === "remove" ? (
        <Icon name={"x"} size={iconSize} />
      ) : (
        <Icon name={"cloudUpload"} size={iconSize} />
      )}
      {children}
    </button>
  );
}
