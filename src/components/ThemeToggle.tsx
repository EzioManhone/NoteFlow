
import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2">
      <Sun size={18} className="text-yellow-500 dark:text-gray-400" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-noteflow-green"
      />
      <Moon size={18} className="text-gray-400 dark:text-indigo-300" />
    </div>
  );
};

export default ThemeToggle;
