import { NavItem } from "@/components/navigation/navigation.types";
import { Calendar, UserRound, Users } from "lucide-react";


export const navItems: NavItem[] = [
  {
    id: "list-seasons",
    label: "Saisons",
    icon: Calendar,
    href: "/seasons"
  },
  {
    id: "list-members",
    label: "Membres",
    icon: UserRound,
    href: "/members"
  },
  {
    id: "list-families",
    label: "Familles",
    icon: Users,
    href: "/families"
  }
];