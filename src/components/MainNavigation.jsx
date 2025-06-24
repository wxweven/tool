import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { categoryNavItems } from "@/nav-items";
import { HomeIcon } from "lucide-react";

const MainNavigation = () => {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-white">
      <div className="container flex h-12 items-center">
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-white/20 hover:bg-white/30 text-white text-sm font-medium"
                  )}
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  首页
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {categoryNavItems.map((category, index) => (
              <NavigationMenuItem key={index}>
                {category.items ? (
                  <>
                    <NavigationMenuTrigger className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium">
                      {category.icon && <span className="mr-2">{React.cloneElement(category.icon, { className: "h-4 w-4" })}</span>}
                      {category.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-lg shadow-lg">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={item.to}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-100 p-2 rounded-md">
                                    {React.cloneElement(item.icon, { className: "h-5 w-5 text-blue-600" })}
                                  </div>
                                  <span className="text-base font-medium leading-none">{item.title}</span>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      to={category.to}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-white/20 hover:bg-white/30 text-white text-sm font-medium"
                      )}
                    >
                      {category.icon && <span className="mr-2">{React.cloneElement(category.icon, { className: "h-4 w-4" })}</span>}
                      {category.title}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default MainNavigation;