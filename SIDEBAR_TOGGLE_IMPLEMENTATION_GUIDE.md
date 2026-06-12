# Sidebar Toggle Implementation Guide

This guide provides a complete step-by-step implementation of a responsive sidebar with toggle functionality, including animated icons and smooth transitions.

## Overview

The sidebar toggle system consists of:
1. **State Management**: A boolean state (`isCollapsed`) that controls sidebar visibility
2. **Toggle Button**: Located in the header with animated icons that change based on state
3. **Responsive Design**: Different behaviors for mobile and desktop screens
4. **Smooth Animations**: CSS transitions for width changes and icon swapping
5. **Icon Logic**: Smart icon switching based on screen size and collapse state

## Core Architecture

### 1. State Management Structure

```typescript
// Main layout component manages the collapse state
const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
```

### 2. Component Hierarchy

```
InventoryLayout (State Owner)
├── Header (Receives state + setter)
│   └── Toggle Button (Triggers state change)
└── Sidebar (Receives state for styling)
    └── Nav (Adapts behavior based on state)
```

## Step-by-Step Implementation

### Step 1: Install Required Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.429.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Step 2: Create the Main Layout with State

```typescript
"use client";

import { useState } from "react";
import Header from "@/components/Common/Header";
import Sidebar from "@/components/Common/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function InventoryLayout({
  children,
}: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className={"flex h-screen w-screen overflow-hidden"}>
      {/* Sidebar Container with Dynamic Width */}
      <div
        className={cn(
          "h-screen border-r border-muted transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-0 md:w-64", // Key responsive logic
        )}
      >
        {/* Sidebar Header/Logo */}
        <Link
          href="/"
          className="flex h-12 items-center justify-center bg-primary text-primary-foreground"
        >
          {isCollapsed ? (
            <span className="text-lg font-semibold">In</span>
          ) : (
            <span className="text-lg font-semibold">Inventory</span>
          )}
        </Link>
        
        {/* Sidebar Content */}
        <ScrollArea className="h-[calc(100vh-48px)]">
          <Sidebar isCollapsed={isCollapsed} />
        </ScrollArea>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <Header setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
        <ScrollArea className="h-[calc(100vh-48px)] p-3">
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
```

### Step 3: Create the Header with Toggle Button

```typescript
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type Props = {
  setIsCollapsed: (isCollapsed: boolean) => void;
  isCollapsed: boolean;
};

export default function Header({ setIsCollapsed, isCollapsed }: Props) {
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-primary px-3 text-primary-foreground">
      {/* Toggle Button with Smart Icon Logic */}
      <button
        onClick={() => handleToggle()}
        className="flex h-8 w-8 transform items-center justify-center rounded-md ring-1 ring-white/10 transition-colors duration-200 ease-in-out hover:bg-white/10"
      >
        {isCollapsed ? (
          <>
            {/* Desktop: Show open icon when collapsed */}
            <PanelLeftOpen className="hidden h-5 w-5 md:block" />
            {/* Mobile: Show close icon when collapsed */}
            <PanelLeftClose className="block h-5 w-5 md:hidden" />
          </>
        ) : (
          <>
            {/* Desktop: Show close icon when expanded */}
            <PanelLeftClose className="hidden h-5 w-5 md:block" />
            {/* Mobile: Show open icon when expanded */}
            <PanelLeftOpen className="block h-5 w-5 md:hidden" />
          </>
        )}
      </button>

      <span className="text-lg font-semibold">Inventory</span>
    </div>
  );
}
```

### Step 4: Create the Responsive Sidebar Component

```typescript
"use client";

import { Nav } from "@/components/ui/nav";
import { House, Users, Package /* your icons */ } from "lucide-react";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isCollapsed: boolean;
};

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <Nav
      isCollapsed={isCollapsed}
      links={[
        {
          title: "Dashboard",
          href: "/inventory",
          icon: House,
          variant: pathname === "/inventory" ? "default" : "ghost",
        },
        // ... more navigation items with dropdownItems for submenus
      ]}
    />
  );
};

export default Sidebar;
```

### Step 5: Create the Advanced Nav Component

```typescript
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
                // COLLAPSED STATE: Show popover on hover
                <Popover>
                  <PopoverTrigger asChild>
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
                  </PopoverTrigger>
                  <PopoverContent side="right" className="flex w-64 flex-col gap-4 border-l-2 bg-background">
                    <div className="flex items-center justify-between gap-4">
                      <span>{link.title}</span>
                      {link.label && (
                        <span className="ml-auto font-semibold text-muted-foreground">
                          {link.label}
                        </span>
                      )}
                    </div>
                    {link.dropdownItems && (
                      <ScrollArea className={cn(
                        link.dropdownItems.length > 5 ? "h-44" : "",
                        "space-y-1 border-l-2 border-primary bg-background",
                      )}>
                        {link.dropdownItems.map((dropdownItem, i) => (
                          <Link
                            key={i}
                            href={dropdownItem.href}
                            className={cn(
                              buttonVariants({
                                variant: pathName === dropdownItem.href ? "default" : "ghost",
                                size: "sm",
                              }),
                              "flex items-center justify-start gap-2 rounded-none pl-0",
                            )}
                          >
                            <dropdownItem.icon className="h-4 w-4 text-primary" />
                            {dropdownItem.title}
                          </Link>
                        ))}
                      </ScrollArea>
                    )}
                  </PopoverContent>
                </Popover>
              ) : (
                // EXPANDED STATE: Show full navigation
                <>
                  <div
                    onClick={() => handleToggleDropdown(index)}
                    className={cn(
                      buttonVariants({
                        variant: isLinkActive || isDropdownActive ? "default" : "ghost",
                        size: "sm",
                      }),
                      "flex cursor-pointer items-center justify-start",
                    )}
                  >
                    <Link href={link.href} className="flex w-full items-center justify-between">
                      <div className="flex items-center justify-start">
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.title}
                      </div>
                      <div className="flex items-center justify-start">
                        {link.label && (
                          <span className="ml-auto">{link.label}</span>
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
                        "ml-5 mt-1 space-y-1 border-l-2 border-primary bg-background",
                        "transition-opacity duration-300 ease-in-out",
                        openDropdownIndex === index
                          ? "block translate-y-0 opacity-100"
                          : "hidden -translate-y-2 opacity-0",
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
                            "flex items-center justify-start gap-2 rounded-none pl-0",
                          )}
                        >
                          <dropdownItem.icon className="h-4 w-4 text-primary" />
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
```

## Key Implementation Details

### 1. Icon Logic Explanation

The toggle button uses smart icon logic that considers both the collapse state and screen size:

```typescript
{isCollapsed ? (
  <>
    {/* Desktop: When collapsed, show "open" icon to indicate action */}
    <PanelLeftOpen className="hidden h-5 w-5 md:block" />
    {/* Mobile: When collapsed, show "close" icon (sidebar is overlay) */}
    <PanelLeftClose className="block h-5 w-5 md:hidden" />
  </>
) : (
  <>
    {/* Desktop: When expanded, show "close" icon to indicate action */}
    <PanelLeftClose className="hidden h-5 w-5 md:block" />
    {/* Mobile: When expanded, show "open" icon (sidebar will overlay) */}
    <PanelLeftOpen className="block h-5 w-5 md:hidden" />
  </>
)}
```

**Why this logic?**
- **Desktop**: Icons indicate the action that will happen (open when closed, close when open)
- **Mobile**: Different behavior because sidebar becomes an overlay rather than pushing content

### 2. Responsive Width Logic

```css
isCollapsed ? "w-16" : "w-0 md:w-64"
```

- **Mobile (`w-0`)**: Sidebar is completely hidden when not collapsed
- **Desktop (`md:w-64`)**: Sidebar has fixed width when expanded
- **Collapsed (`w-16`)**: Minimal width showing only icons on all screen sizes

### 3. Animation Classes

```css
"transition-all duration-300 ease-in-out"
```

Applied to both sidebar container and main content for smooth width transitions.

### 4. Dropdown Animations

```css
openDropdownIndex === index
  ? "block translate-y-0 opacity-100"
  : "hidden -translate-y-2 opacity-0"
```

Smooth slide-down effect with opacity transition for dropdown menus.

## How It All Works Together

### State Flow:
1. **User clicks toggle button** in Header component
2. **`handleToggle()` function** calls `setIsCollapsed(!isCollapsed)`
3. **State change triggers re-render** of all components receiving the state
4. **Sidebar container width** changes based on `isCollapsed` value
5. **Icons switch** based on both `isCollapsed` state and screen size
6. **Nav component behavior** adapts (popover vs expanded menus)

### Responsive Behavior:
- **Desktop (md+)**: Sidebar pushes content, shows full navigation
- **Mobile**: Sidebar overlays content, shows icon-only navigation
- **Collapsed**: Always shows minimal icon-only sidebar

### Animation Sequence:
1. **Button click** triggers state change
2. **CSS transitions** animate width changes over 300ms
3. **Icon changes** happen instantly (no transition needed)
4. **Content reflows** smoothly due to flexbox layout

## Customization Options

### 1. Change Animation Duration
```css
"transition-all duration-500 ease-in-out" // Slower animation
"transition-all duration-150 ease-in-out" // Faster animation
```

### 2. Modify Breakpoints
```css
isCollapsed ? "w-16" : "w-0 lg:w-80" // Larger desktop width, different breakpoint
```

### 3. Different Icons
```typescript
import { Menu, X } from "lucide-react";

// Use hamburger menu and X icons instead
{isCollapsed ? <Menu /> : <X />}
```

### 4. Add Persistence
```typescript
// Save state to localStorage
const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  }
  return false;
});

const handleToggle = () => {
  const newState = !isCollapsed;
  setIsCollapsed(newState);
  localStorage.setItem('sidebar-collapsed', newState.toString());
};
```

## Troubleshooting

### Common Issues:

1. **Icons not showing**: Ensure `lucide-react` is installed
2. **No animations**: Check that `tailwindcss-animate` is configured
3. **Mobile responsiveness**: Verify Tailwind breakpoint classes are working
4. **State not updating**: Ensure state is passed correctly through component hierarchy
5. **Popover not working**: Verify `@radix-ui/react-popover` is installed

## Browser Support

- **CSS Transitions**: All modern browsers
- **CSS Grid**: IE11+ (with prefixes)
- **Flexbox**: All modern browsers
- **CSS Custom Properties**: IE11+ (with polyfill)

## Performance Considerations

- Animations use CSS transforms (GPU accelerated)
- State changes are debounced through React's batching
- Icons are tree-shaken from lucide-react
- No JavaScript animations (pure CSS)

---

**Copy this entire guide to implement the same sidebar toggle functionality in any React/Next.js project with Tailwind CSS.**
