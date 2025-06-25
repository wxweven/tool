import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, StarIcon, SortAscIcon, SortDescIcon } from "lucide-react";
import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { devTools, textTools, lifeTools, efficiencyTools } from "@/tools-data.jsx";

const allTools = [...devTools, ...textTools, ...lifeTools, ...efficiencyTools];

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const favoriteTools = useMemo(() => {
    return allTools.filter(tool => favorites.includes(tool.id));
  }, [favorites]);

  const sortedFavoriteTools = useMemo(() => {
    const sorted = [...favoriteTools].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title, 'zh-Hans-CN', { numeric: true });
      } else {
        return b.title.localeCompare(a.title, 'zh-Hans-CN', { numeric: true });
      }
    });
    return sorted;
  }, [favoriteTools, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  if (favoriteTools.length === 0) {
    return (
      <div className="text-center py-20">
        <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">您还没有收藏任何工具</h2>
        <p className="mt-2 text-muted-foreground">快去首页发现并收藏您喜欢的工具吧！</p>
        <Button asChild className="mt-6">
          <Link to="/">返回首页</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的收藏</h1>
        <Button variant="outline" onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? <SortAscIcon className="mr-2 h-4 w-4" /> : <SortDescIcon className="mr-2 h-4 w-4" />}
          {sortOrder === 'asc' ? '升序' : '降序'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedFavoriteTools.map((tool) => (
          <Link to={`/${tool.id}`} key={tool.id} className="group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-7 w-7"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(tool.id);
                }}
              >
                <StarIcon className={`h-5 w-5 ${favorites.includes(tool.id) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
              </Button>
              <CardHeader className="pb-3">
                <div className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  {tool.icon}
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="link" className="pl-0 group-hover:pl-2 transition-all text-sm p-0 h-auto">
                  开始使用 <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;