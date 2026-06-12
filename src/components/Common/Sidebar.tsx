"use client";

import { Nav } from "@/components/ui/nav";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tags, 
  Boxes, 
  Layers,
  ShoppingCart,
  FileText,
  TrendingUp,
  BarChart3,
  Archive
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type SidebarProps = {
  isCollapsed: boolean;
};

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      setUser(JSON.parse(authUser));
    }
  }, []);

  const links = [
    // Dashboard - Admin only
    ...(user?.role === 'admin' ? [{
      title: "Tableau de Bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      variant: pathname === "/dashboard" ? "default" as const : "ghost" as const,
    }] : []),
    
    // References with dropdown
    {
      title: "Références",
      href: "/references",
      icon: Archive,
      variant: pathname.startsWith("/references") ? "default" as const : "ghost" as const,
      dropdownItems: [
        {
          title: "Catégories",
          href: "/references/categories",
          icon: Tags,
          variant: pathname.startsWith("/references/categories") ? "default" as const : "ghost" as const,
        },
        {
          title: "Matériaux",
          href: "/references/materials",
          icon: Package,
          variant: pathname.startsWith("/references/materials") ? "default" as const : "ghost" as const,
        },
        {
          title: "Variantes",
          href: "/references/variants",
          icon: Layers,
          variant: pathname.startsWith("/references/variants") ? "default" as const : "ghost" as const,
        },
        {
          title: "Fournisseurs",
          href: "/references/suppliers",
          icon: Users,
          variant: pathname.startsWith("/references/suppliers") ? "default" as const : "ghost" as const,
        },
        {
          title: "Commandes Fournisseurs",
          href: "/references/supplier-orders",
          icon: ShoppingCart,
          variant: pathname.startsWith("/references/supplier-orders") ? "default" as const : "ghost" as const,
        },
      ],
    },
    
    // Stock with dropdown
    {
      title: "Stock",
      href: "/stock",
      icon: Boxes,
      variant: pathname.startsWith("/stock") ? "default" as const : "ghost" as const,
      dropdownItems: [
        {
          title: "Niveaux de Stock",
          href: "/stock/stock",
          icon: BarChart3,
          variant: pathname.startsWith("/stock/stock") ? "default" as const : "ghost" as const,
        },
        {
          title: "Mouvements",
          href: "/stock/movements",
          icon: TrendingUp,
          variant: pathname.startsWith("/stock/movements") ? "default" as const : "ghost" as const,
        },
      ],
    },
    
    // Achats with dropdown
    {
      title: "Achats",
      href: "/achat",
      icon: ShoppingCart,
      variant: pathname.startsWith("/achat") ? "default" as const : "ghost" as const,
      dropdownItems: [
        {
          title: "Factures",
          href: "/achat/invoices",
          icon: FileText,
          variant: pathname.startsWith("/achat/invoices") ? "default" as const : "ghost" as const,
        },
      ],
    },
  ];

  return (
    <Nav
      isCollapsed={isCollapsed}
      links={links}
    />
  );
};

export default Sidebar;
