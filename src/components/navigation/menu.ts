import { NavItem } from "@/components/navigation/navigation.types";
import { Calendar, Drama, Euro, UserRound, Users } from "lucide-react";


export const navItems: NavItem[] = [
  {
    id: "list-seasons",
    label: "Saisons",
    icon: Calendar,
    href: "/seasons"
  }, {
    id: "list-workshops",
    label: "Ateliers",
    icon: Drama,
    href: "/workshops"
  }, {
    id: "list-members",
    label: "Membres",
    icon: UserRound,
    href: "/members"
  }, {
    id: "list-families",
    label: "Familles",
    icon: Users,
    href: "/families"
  }, {
    id: "list-payments",
    label: "Paiements",
    icon: Euro,
    href: "/payments"
  }
];