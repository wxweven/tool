import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  CodeIcon,
  LinkIcon,
  FileTextIcon,
  TerminalIcon,
  CpuIcon,
  GiftIcon,
  ArrowRightIcon,
  CalculatorIcon,
  WrenchIcon,
  HeartIcon,
  FileCodeIcon,
  ChevronUpIcon,
  BracesIcon,
  FileDiffIcon,
  FilterIcon,
  DownloadIcon,
  MinusIcon,
  TextIcon,
  StarIcon,
  ZapIcon
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { devTools, lifeTools, textTools, efficiencyTools } from "@/tools-data.jsx";

const allTools = [...devTools, ...textTools, ...lifeTools, ...efficiencyTools];

const ToolCategory = ({ title, icon, tools }) => {
  const { favorites, toggleFavorite } = useFavorites();
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-muted">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
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

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <ChevronUpIcon className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

const Index = () => {
  const { favorites } = useFavorites();
  const favoriteTools = allTools.filter(tool => favorites.includes(tool.id));

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
          开发者工具箱
        </h1>
      </div>

      {favoriteTools.length > 0 && (
        <ToolCategory
          title="我的收藏"
          icon={<StarIcon className="h-4 w-4" />}
          tools={favoriteTools}
        />
      )}

      <ToolCategory
        title="开发者工具"
        icon={<WrenchIcon className="h-4 w-4" />}
        tools={devTools}
      />

      <ToolCategory
        title="文本工具"
        icon={<TextIcon className="h-4 w-4" />}
        tools={textTools}
      />

      <ToolCategory
        title="效率工具"
        icon={<ZapIcon className="h-4 w-4" />}
        tools={efficiencyTools}
      />

      <ToolCategory
        title="生活工具"
        icon={<HeartIcon className="h-4 w-4" />}
        tools={lifeTools}
      />

      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold mb-2">一站式解决开发/生活中的常见需求，提升工作效率</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          如果您有特定需求或创意工具想法，欢迎反馈给我。个人微信：wxweven
        </p>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Index;
