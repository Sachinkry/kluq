import { SidebarProvider } from "@/components/ui/sidebar"
import { HeaderProvider } from "@/modules/dashboard/context/header-context"
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar"
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar"

interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <SidebarProvider>
            <HeaderProvider>
                <DashboardSidebar />
                <main className="flex flex-col h-screen w-screen bg-muted ">
                    <DashboardNavbar />
                    {children}
                </main>
            </HeaderProvider>
        </SidebarProvider>
    )
}

export default Layout