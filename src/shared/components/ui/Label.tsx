import { Label as ShadcnLabel } from "@/components/ui/label";
import { forwardRef } from "react";

type LabelProps = React.ComponentPropsWithoutRef<typeof ShadcnLabel>;

const Label = forwardRef<React.ElementRef<typeof ShadcnLabel>, LabelProps>(
  ({ className, ...props }, ref) => (
    <ShadcnLabel ref={ref} className={className} {...props} />
  ),
);

Label.displayName = "Label";

export { Label };
export type { LabelProps };
