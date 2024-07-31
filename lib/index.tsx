import {
  Home,
  FolderKanban,
  Proportions,
  Settings2,
  InfoIcon,
  SquareUserRound,
} from "lucide-react";

export const primaryNavItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    link: "/dashboard",
    icon: <Home className="h-4 w-4" />,
  },
  {
    name: "Projects",
    link: "/dashboard/projects",
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    name: "Settings",
    link: "/dashboard/settings",
    icon: <Settings2 className="h-4 w-4" />,
  },
  {
    name: "Account",
    link: "/dashboard/account",
    icon: <SquareUserRound className="h-4 w-4" />,
  },
  {
    name: "About",
    link: "/dashboard/about",
    icon: <InfoIcon className="h-4 w-4" />,
  },
];
