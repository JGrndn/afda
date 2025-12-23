'use client'

import { MobileSideBar, TopBar, SideBar, useNavigation } from "@/components/navigation";

function LayoutContent({ children, title }: { 
  children: React.ReactNode
  title: string 
}) {
  const { isCollapsed } = useNavigation();

  return (
    <>
      <TopBar title={title} />
      <SideBar title={title} />
      <MobileSideBar />
      
      <main
        className={`
          transition-all duration-300 ease-in-out
          pt-16 lg:pt-0
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </>
  );
}

export function Layout({ children, title }: { 
  children: React.ReactNode 
  title: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LayoutContent title={title}>{children}</LayoutContent>
    </div>
  );
}