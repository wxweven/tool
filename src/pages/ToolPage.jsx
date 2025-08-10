import TimestampConverter from "../tools/TimestampConverter";
import JsonFormatter from "../tools/JsonFormatter";
import UrlEncoder from "../tools/UrlEncoder";
import PlainTextExtractor from "../tools/PlainTextExtractor";
import JavaToJson from "../tools/JavaToJson";
import ShellCommands from "../tools/ShellCommands";
import RegexTester from "../tools/RegexTester";
import LotteryTool from "../tools/LotteryTool";
import MortgageCalculator from "../tools/MortgageCalculator";
import CodeFormatter from "../tools/CodeFormatter";
import JavaToStringFormatter from "../tools/JavaToStringFormatter";
import TextDiff from "../tools/TextDiff";
import RemoveDuplicates from "../tools/RemoveDuplicates";
import DownloadFiles from "../tools/DownloadFiles";
import SubstractLines from "../tools/SubstractLines";
import BatchGenerator from "../tools/BatchGenerator";
import ExcelToSql from "../tools/ExcelToSql";
import ExcelToTable from "../tools/ExcelToTable";
import CountdownReminder from "../tools/CountdownReminder";
import ExpressTracker from "../tools/ExpressTracker";
import LunchRandomizer from "../tools/LunchRandomizer";
import UnitConverter from "../tools/UnitConverter";
import BMICalculator from "../tools/BMICalculator";
import DailyQuote from "../tools/DailyQuote";
import QRCodeTool from "../tools/QRCodeTool";
import RandomGroupTool from "../tools/RandomGroupTool";
import ExpenseTracker from "../tools/ExpenseTracker";
import PasswordGenerator from "../tools/PasswordGenerator";
import PomodoroTimer from "../tools/PomodoroTimer";
import ColorToolkit from "../tools/ColorToolkit";
import NumberBaseConverter from "../tools/NumberBaseConverter";
import ImageCompressor from "../tools/ImageCompressor";
import PictureProcessor from "../tools/PictureProcessor";
import FileHashCalculator from "../tools/FileHashCalculator";
import ShortcutKeysReference from "../tools/ShortcutKeysReference";
import NetworkUtilities from "../tools/NetworkUtilities";
import NumberPuzzle from "../games/games/NumberPuzzle/NumberPuzzle";
import MemoryCard from "../games/games/MemoryCard/MemoryCard";
import Sudoku from "../games/games/Sudoku/Sudoku";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { useFavorites } from "../context/FavoritesContext";
import { navItems } from "../nav-items.jsx";
import MedicineReminder from "../tools/MedicineReminder";
import ClockIn from "../tools/ClockIn";
import InvalidImageUrlDetector from "../tools/InvalidImageUrlDetector";
import TextProcessor from "../tools/TextProcessor";
import FileSplitter from "../tools/FileSplitter";

const ToolPage = ({ toolId }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const tool = navItems.find(item => item.to === `/${toolId}`);
  const title = tool ? tool.title : "工具";

  const handleFavoriteClick = () => {
    if (isFavorite(toolId)) {
      removeFavorite(toolId);
    } else {
      addFavorite(toolId);
    }
  };

  const renderTool = () => {
    switch (toolId) {
      case "timestamp":
        return <TimestampConverter />;
      case "json":
      case "json-formatter":
        return <JsonFormatter />;
      case "url":
        return <UrlEncoder />;
      case "plaintext":
        return <PlainTextExtractor />;
      case "java-json":
        return <JavaToJson />;
      case "shell":
        return <ShellCommands />;
      case "regex":
        return <RegexTester />;
      case "lottery":
        return <LotteryTool />;
      case "mortgage":
        return <MortgageCalculator />;
      case "code-formatter":
        return <CodeFormatter />;
      case "java-tostring":
        return <JavaToStringFormatter />;
      case "text-diff":
        return <TextDiff />;
      case "remove-duplicates":
        return <RemoveDuplicates />;
      case "text-processor":
        return <TextProcessor />;
      case "download-files":
        return <DownloadFiles />;
      case "substract-lines":
        return <SubstractLines />;
      case "batch-generator":
        return <BatchGenerator />;
      case "excel-to-sql":
        return <ExcelToSql />;
      case "excel-to-table":
        return <ExcelToTable />;
      case "countdown-reminder":
        return <CountdownReminder />;
      case "express-tracker":
        return <ExpressTracker />;
      case "lunch-randomizer":
        return <LunchRandomizer />;
      case "unit-converter":
        return <UnitConverter />;
      case "bmi-calculator":
        return <BMICalculator />;
      case "daily-quote":
        return <DailyQuote />;
      case "qr-code":
        return <QRCodeTool />;
      case "random-group":
        return <RandomGroupTool />;
      case "expense-tracker":
        return <ExpenseTracker />;
      case "password-generator":
        return <PasswordGenerator />;
      case "pomodoro-timer":
        return <PomodoroTimer />;
      case "color-toolkit":
        return <ColorToolkit />;
      case "number-base-converter":
        return <NumberBaseConverter />;
      case "image-compressor":
        return <ImageCompressor />;
      case "invalid-image-url-detector":
        return <InvalidImageUrlDetector />;
      case "picture-processor":
        return <PictureProcessor />;
      case "file-hash-calculator":
        return <FileHashCalculator />;
      case "shortcut-keys-reference":
        return <ShortcutKeysReference />;
      case "network-utilities":
        return <NetworkUtilities />;
      case "number-puzzle":
        return <NumberPuzzle />;
      case "memory-card":
        return <MemoryCard />;
      case "sudoku":
        return <Sudoku />;
      case "medicine-reminder":
        return <MedicineReminder />;
      case "clock-in":
        return <ClockIn />;
      case "file-splitter":
        return <FileSplitter />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">工具未找到</h2>
            <p className="text-muted-foreground mt-2">请选择正确的工具</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label={isFavorite(toolId) ? "取消收藏" : "收藏"}
        >
          {isFavorite(toolId) ? (
            <StarIconSolid className="h-6 w-6 text-yellow-400" />
          ) : (
            <StarIconOutline className="h-6 w-6 text-gray-400" />
          )}
        </button>
      </div>
      {renderTool()}
    </div>
  );
};

export default ToolPage;
