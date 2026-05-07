import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";
import { ComponentPropsWithRef, forwardRef } from "react";

type ButtonProps = ComponentPropsWithRef<typeof ShadcnButton>;
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <ShadcnButton className={className} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
