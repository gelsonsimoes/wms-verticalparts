import React from 'react';
import { Bell, Search, Globe, User, Cloud, Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent/30" />
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-64">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar pedido, produto..."
                        className="bg-transparent border-none text-xs focus:ring-0 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-2 py-1 bg-success/10 text-success rounded-full border border-success/20">
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Sincronizado Omie</span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-background-dark"></span>
                    </button>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

                    <div className="flex items-center gap-3 pl-1">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold leading-none">Clybas</p>
                            <p className="text-[10px] text-slate-500 font-medium">VerticalParts MG</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
