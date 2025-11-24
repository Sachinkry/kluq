"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileIcon, HomeIcon, StarIcon, MessageSquareText, ChevronRight, HistoryIcon, EditIcon, SearchIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { DashboardUserButton } from "./dashboard-user-button"
import { groupChatsByDate } from "@/lib/grouped-history"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible" // <--- Import Collapsible

import { 
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuItem,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar"

const firstSection = [
    {
        icon: EditIcon,
        label: "New Chat",
        href: "/chat",
    },
    {
        icon: SearchIcon,
        label: "Search Papers",
        href: "/search",
    },
]

const secondSection = [
    {
        icon: StarIcon,
        label: "Upgrade",
        href: "/upgrade",
    }
]

export const DashboardSidebar = () => {
    const pathname = usePathname();
    const [groupedHistory, setGroupedHistory] = useState<ReturnType<typeof groupChatsByDate>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch("/api/history/sidebar");
                if (res.ok) {
                    const data = await res.json();
                    const grouped = groupChatsByDate(data.history || []);
                    setGroupedHistory(grouped);
                }
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [pathname]);

    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href={"/"} className="flex items-center gap-2 px-2 pt-2">
                    <Image src={"/logo.svg"} alt="logo" width={36} height={36} />
                    <p className="text-2xl font-semibold">Kluq.AI</p>
                </Link>
            </SidebarHeader>
            
            <div className="px-4 py-2">
                <Separator className="opacity-10 text-[#5D6B68]" />
            </div>

            <SidebarContent>
                {/* MAIN MENU */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {firstSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild
                                        className={cn(
                                            "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                                            pathname === item.href && "bg-linear-to-r/oklch border-[#5D6B68]/10"
                                        )}
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-4" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* COLLAPSIBLE HISTORY SECTION */}
                <Collapsible defaultOpen={false} className="group/collapsible ">
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <CollapsibleTrigger className="flex w-full py-3  items-center text-xs font-medium text-muted-foreground/70 hover:bg-sidebar-accent/50 hover:text-white transition-colors cursor-pointer">
                                <HistoryIcon className="mr-2 size-4" />
                                History
                                <span className="ml-auto">
                                    <ChevronRight className="mr-2 size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </span>
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                {loading ? (
                                    <div className="px-4 py-2 text-xs text-muted-foreground">Loading...</div>
                                ) : groupedHistory.length === 0 ? (
                                    <div className="px-4 py-2 text-xs text-muted-foreground">No recent chats</div>
                                ) : (
                                    groupedHistory.map((group) => (
                                        <div key={group.label} className="mt-4 first:mt-1">
                                            <div className="px-4 mb-1 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                                                {group.label}
                                            </div>
                                            <SidebarMenu>
                                                {group.items.map((item) => (
                                                    <SidebarMenuItem key={item.chatId}>
                                                        <SidebarMenuButton 
                                                            asChild 
                                                            className={cn(
                                                                "h-auto py-2 hover:bg-sidebar-accent/50 pl-8", // Added pl-8 for hierarchy indentation
                                                                pathname === `/chat/${item.paperId}` && "bg-sidebar-accent text-sidebar-accent-foreground"
                                                            )}
                                                        >
                                                            <Link href={`/chat/${item.paperId}`}>
                                                                <MessageSquareText className="size-4 shrink-0" />
                                                                <div className="flex flex-col gap-0.5 overflow-hidden min-w-0 flex-1">
                                                                    <span className="truncate text-xs font-medium text-left block w-full cursor-pointer">
                                                                        {item.paperTitle || "Untitled Paper"}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </div>
                                    ))
                                )}
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>

                <div className="px-4 py-2 mt-auto">
                    <Separator className="opacity-10 text-[#5D6B68]" />
                </div>
                
                {/* BOTTOM SECTION */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondSection.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        asChild
                                        className="h-10"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="size-5" />
                                            <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter className="text-white">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    )
}