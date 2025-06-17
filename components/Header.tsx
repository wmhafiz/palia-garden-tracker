"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { name: "Tracker", href: "/" },
        { name: "Import", href: "/import" },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-card text-card-foreground shadow-md border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title Section */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-primary-foreground" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-foreground leading-tight">
                                Palia Garden Tracker
                            </h1>
                            <p className="text-xs text-muted-foreground leading-tight">
                                A player-made tool for tracking your garden
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigationItems.map((item) => (
                            <Button
                                key={item.name}
                                variant="ghost"
                                size="sm"
                                className="text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                asChild
                            >
                                <a href={item.href}>{item.name}</a>
                            </Button>
                        ))}
                        <div className="ml-2 pl-2 border-l border-border">
                            <ThemeToggle />
                        </div>
                    </nav>

                    {/* Mobile Menu Button and Theme Toggle */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMobileMenu}
                            className="text-foreground hover:bg-accent hover:text-accent-foreground"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.name}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    asChild
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <a href={item.href}>{item.name}</a>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;