"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
    href: string;
    dropdownItems?: {
      title: string;
      href: string;
      label?: string;
      icon: LucideIcon;
      variant: "default" | "ghost";
    }[];
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathName = usePathname();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  // Auto-open dropdown if active item is inside
  useEffect(() => {
    links.forEach((link, index) => {
      if (link.dropdownItems) {
        const isDropdownActive = link.dropdownItems.some(
          (dropdownItem) => pathName === dropdownItem.href,
        );
        if (isDropdownActive) {
          setOpenDropdownIndex(index);
        }
      }
    });
  }, [pathName, links]);

  const handleToggleDropdown = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex min-h-[calc(100vh-48px)] flex-col gap-4 py-2 data-[collapsed=true]:gap-1 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const isLinkActive = pathName === link.href;
          const isDropdownActive = link.dropdownItems?.some(
            (dropdownItem) => pathName === dropdownItem.href,
          );

          return (
            <div key={index} className="relative">
              {isCollapsed ? (
                // COLLAPSED STATE: Show tooltip on hover
                <div className="group/tooltip relative">
                  <Link
                    href={link.href}
                    className={cn(
                      buttonVariants({
                        variant: isLinkActive || isDropdownActive ? "default" : "ghost",
                        size: "icon",
                      }),
                      "h-9 w-9",
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="sr-only">{link.title}</span>
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute left-full top-0 ml-2 hidden group-hover/tooltip:block z-50">
                    <div className="bg-gray-900 text-white text-sm rounded-md px-2 py-1 whitespace-nowrap">
                      {link.title}
                      {link.dropdownItems && (
                        <div className="mt-1 space-y-1">
                          {link.dropdownItems.map((dropdownItem, i) => (
                            <Link
                              key={i}
                              href={dropdownItem.href}
                              className="block px-2 py-1 hover:bg-gray-700 rounded text-xs"
                            >
                              {dropdownItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // EXPANDED STATE: Show full navigation
                <>
                  <div
                    onClick={() => link.dropdownItems && handleToggleDropdown(index)}
                    className={cn(
                      buttonVariants({
                        variant: isLinkActive || isDropdownActive ? "default" : "ghost",
                        size: "sm",
                      }),
                      "flex cursor-pointer items-center justify-start w-full",
                    )}
                  >
                    <Link href={link.href} className="flex w-full items-center justify-between">
                      <div className="flex items-center justify-start">
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.title}
                      </div>
                      <div className="flex items-center justify-start">
                        {link.label && (
                          <span className="ml-auto text-xs">{link.label}</span>
                        )}
                        {link.dropdownItems && (
                          <ChevronDown
                            className={cn("ml-2 h-4 w-4 transition-transform", {
                              "rotate-180": openDropdownIndex === index,
                            })}
                          />
                        )}
                      </div>
                    </Link>
                  </div>
                  {link.dropdownItems && (
                    <div
                      className={cn(
                        "ml-5 mt-1 space-y-1 border-l-2 border-indigo-200 bg-background pl-2",
                        "transition-all duration-300 ease-in-out",
                        openDropdownIndex === index
                          ? "block translate-y-0 opacity-100 max-h-96"
                          : "hidden -translate-y-2 opacity-0 max-h-0",
                      )}
                    >
                      {link.dropdownItems.map((dropdownItem, i) => (
                        <Link
                          key={i}
                          href={dropdownItem.href}
                          className={cn(
                            buttonVariants({
                              variant: pathName === dropdownItem.href ? "default" : "ghost",
                              size: "sm",
                            }),
                            "flex items-center justify-start gap-2 rounded-md w-full",
                          )}
                        >
                          <dropdownItem.icon className="h-4 w-4" />
                          {dropdownItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
