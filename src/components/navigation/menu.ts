import { NavItem } from "@/components/navigation/navigation.types";
import { Calendar } from "lucide-react";


export const navItems: NavItem[] = [
  {
    id: "list-seasons",
    label: "Saisons",
    icon: Calendar,
    href: "/saisons"
  }
];