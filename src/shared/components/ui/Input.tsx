import { Input as ShadcnInput } from "@/components/ui/input";
import { forwardRef } from "react";

type InputProps = React.ComponentPropsWithoutRef<typeof ShadcnInput>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <ShadcnInput ref={ref} className={className} {...props} />
  ),
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
