import { Text } from "react-native";
import { ReactNode } from "react";

interface CustomTextProps {
  children: ReactNode;
  className?: string;
}

export function CustomText({ children, className }: CustomTextProps) {
  const baseClasses = "pl-2 text-gray-12 dark:text-gray-1";
  const combinedClasses = className
    ? `${baseClasses} ${className}`
    : baseClasses;

  return <Text className={combinedClasses}>{children}</Text>;
}
