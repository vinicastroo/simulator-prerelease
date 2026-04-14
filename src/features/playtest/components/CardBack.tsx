import type { ComponentPropsWithoutRef } from "react";

type CardBackProps = ComponentPropsWithoutRef<"div"> & {
  tapped?: boolean;
};

export function CardBack({
  className = "",
  tapped = false,
  ...props
}: CardBackProps) {
  return (
    <div
      className={`bg-gradient-to-br from-[#1a1f35] to-[#0d1020] border border-[#2a3050] rounded-[4px] flex items-center justify-center ${tapped ? "opacity-70" : ""} ${className}`}
      {...props}
    >
      <div className="w-[78%] h-[78%] border border-[#2a3050] rounded-[2px] flex items-center justify-center">
        <span className="text-[#2a3050] text-[10px] font-bold tracking-widest">
          MTG
        </span>
      </div>
    </div>
  );
}
