"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder button with consistent styling during hydration
        return (
            <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                disabled
                aria-label="Loading theme toggle"
            >
                <Monitor className="w-5 h-5" />
            </Button>
        );
    }

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
            // } else if (theme === "dark") {
            //     setTheme("system");
        } else {
            setTheme("light");
        }
    };

    const getIcon = () => {
        switch (theme) {
            case "light":
                return <Sun className="w-5 h-5" />;
            case "dark":
                return <Moon className="w-5 h-5" />;
            case "system":
            default:
                return <Monitor className="w-5 h-5" />;
        }
    };

    const getAriaLabel = () => {
        switch (theme) {
            case "light":
                return "Switch to dark theme";
            case "dark":
                return "Switch to system theme";
            case "system":
            default:
                return "Switch to light theme";
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
            aria-label={getAriaLabel()}
            title={`Current theme: ${theme || 'system'}`}
        >
            <div className="transition-transform duration-200 hover:rotate-12">
                {getIcon()}
            </div>
        </Button>
    );
};

export default ThemeToggle;