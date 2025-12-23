import { NavItem } from "@/components/navigation/navigation.types";
import { Calendar, Users } from "lucide-react";


export const navItems: NavItem[] = [
  {
    id: "list-members", href: "/members", label: "Members", icon: Users, badge: 3
  },
  { 
    id: "", label: 'Management', icon: Calendar, children: [
      { id:"list-seasons", href: '/seasons', label: 'Seasons', badge:'new' },
      { id:"list-workshops", href: '/workshops', label: 'Workshops' },
    ]
  },
];