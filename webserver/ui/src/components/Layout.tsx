import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Folder, Eye, Settings } from "lucide-react";
import { SystemStatus } from "../types";
import { api } from "../api/client";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  const navItems: Array<{
    path: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = [
    { path: "/mappings", label: "Mappings", icon: Folder },
    { path: "/preview", label: "Preview", icon: Eye },
    { path: "/config", label: "Config", icon: Settings },
  ];

  const isActive = (path: string): boolean => {
    return (
      location.pathname === path ||
      (path === "/mappings" && location.pathname === "/")
    );
  };

  // Load system status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await api.system.getStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error("Failed to load system status:", error);
      }
    };

    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-secondary border-r border-default p-6 flex-shrink-0">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold m-0">LED Mapping</h1>
          <p className="text-secondary text-sm mt-1 m-0">Light Show Designer</p>
        </div>

        {/* Navigation */}
        <div className="px-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-3 my-1 rounded-md transition-all duration-200 no-underline font-medium
                ${
                  isActive(item.path)
                    ? "text-white bg-primary-600"
                    : "text-secondary hover:bg-hover hover:text-primary"
                }
              `}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-auto pt-6 border-t border-default">
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  systemStatus?.status === "running"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-secondary">
                {systemStatus?.status === "running"
                  ? "System Running"
                  : "System Error"}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted leading-relaxed">
            <div>LEDs: {systemStatus?.ledCount || 150}</div>
            <div>Port: 8081</div>
            {systemStatus?.currentMapping && (
              <div
                className="mt-1 truncate"
                title={systemStatus.currentMapping}
              >
                Active: {systemStatus.currentMapping.replace(".json", "")}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

export default Layout;
