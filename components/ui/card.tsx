import * as React from "react";
import { Pressable, View } from "react-native";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable>
>(({ className, ...props }, ref) => (
  <Pressable
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card p-4 shadow-none",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card }; 