"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react"
import { DashboardCommand } from "./dashboard-command"
import { useEffect, useState } from "react"
import { useHeader } from "@/modules/dashboard/context/header-context" 

export const DashboardNavbar = () => {
    const { state, toggleSidebar, isMobile} = useSidebar();
    const [commandOpen, setCommandOpen] = useState(false)
    const { title } = useHeader(); // <--- Consume Context

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if(e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setCommandOpen((open) => !open);
            }
        }; 

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down)
    },[])

    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
            <nav className="flex px-4 gap-x-2 items-center py-3 border-b bg-background h-14 shrink-0">
                <Button className="size-9" variant={"outline"} onClick={toggleSidebar}>
                    {(state === "collapsed" || isMobile) 
                    ? <PanelLeftIcon className="size-4" /> 
                    : <PanelLeftCloseIcon className="size-4" /> } 
                </Button>

                {/* DYNAMIC TITLE SECTION */}
                {title ? (
                    <div className="flex items-center ml-2 border-l pl-4 h-6 fade-in animate-in duration-300">
                        <h2 className="font-semibold text-slate-900 text-sm truncate max-w-[400px] md:max-w-[700px]">
                            {title}
                        </h2>
                    </div>
                ) : (
                    /* Default Search Button (Hide when title is present, or keep both if preferred) */
                    <Button 
                        variant={"outline"}
                        size={"sm"}
                        onClick={() => setCommandOpen((open) => !open)}
                        className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground ml-2"
                    >
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Search Paper {title ? "Paper" : "Papers"}
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 bg-muted border px-1.5 font-mono text-[10px] rounded font-medium text-muted-foreground">
                            <span className="text-xs">&#8984;</span>K
                        </kbd>
                    </Button>
                )}
            </nav>
        </>
    )
}