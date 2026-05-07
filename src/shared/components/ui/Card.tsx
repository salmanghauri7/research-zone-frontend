import {
  Card as ShadcnCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { forwardRef } from "react";

type CardProps = React.ComponentPropsWithoutRef<typeof ShadcnCard>;
type CardHeaderProps = React.ComponentPropsWithoutRef<typeof CardHeader>;
type CardFooterProps = React.ComponentPropsWithoutRef<typeof CardFooter>;
type CardTitleProps = React.ComponentPropsWithoutRef<typeof CardTitle>;
type CardDescriptionProps = React.ComponentPropsWithoutRef<
  typeof CardDescription
>;
type CardContentProps = React.ComponentPropsWithoutRef<typeof CardContent>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <ShadcnCard ref={ref} className={className} {...props} />
  ),
);
Card.displayName = "Card";

const CardComponentHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <CardHeader ref={ref} className={className} {...props} />
  ),
);
CardComponentHeader.displayName = "CardHeader";

const CardComponentFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <CardFooter ref={ref} className={className} {...props} />
  ),
);
CardComponentFooter.displayName = "CardFooter";

const CardComponentTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <CardTitle ref={ref} className={className} {...props} />
  ),
);
CardComponentTitle.displayName = "CardTitle";

const CardComponentDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <CardDescription ref={ref} className={className} {...props} />
));
CardComponentDescription.displayName = "CardDescription";

const CardComponentContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <CardContent ref={ref} className={className} {...props} />
  ),
);
CardComponentContent.displayName = "CardContent";

export {
  Card,
  CardComponentHeader as CardHeader,
  CardComponentFooter as CardFooter,
  CardComponentTitle as CardTitle,
  CardComponentDescription as CardDescription,
  CardComponentContent as CardContent,
};

export type {
  CardProps,
  CardHeaderProps,
  CardFooterProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
};
