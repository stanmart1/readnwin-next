"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import AdminSidebar from "./AdminSidebar";
import { usePermissions } from "@/app/hooks/usePermissions";
import { canAccessTab } from "@/utils/permission-mapping";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const OverviewStats = lazy(() => import("./OverviewStats"));
const UserManagement = lazy(() => import("./UserManagement"));
const RoleManagement = lazy(() => import("./RoleManagement"));
const AuditLog = lazy(() => import("./AuditLog"));
const BookManagementEnhanced = lazy(() => import("./BookManagementEnhanced"));
const ReviewManagement = lazy(() => import("./ReviewManagement"));
const OrdersManagement = lazy(() => import("./OrdersManagement"));
const EnhancedShippingManagement = lazy(
  () => import("./EnhancedShippingManagement"),
);
const ReadingAnalytics = lazy(() => import("./ReadingAnalytics"));
const ReportsSection = lazy(() => import("./ReportsSection"));
const EmailTemplateManagement = lazy(() => import("./EmailTemplateManagement"));
const BlogManagement = lazy(() => import("./BlogManagement"));
const WorksManagement = lazy(() => import("./WorksManagement"));
const EnhancedAboutManagement = lazy(() => import("./EnhancedAboutManagement"));
const ContactManagement = lazy(() => import("./ContactManagement"));
const FooterManagement = lazy(() => import("./FooterManagement"));
const SystemSettings = lazy(() => import("./SystemSettings"));
const FAQManagement = lazy(() => import("./faq-management/page"));

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
  const { permissions, loading: permissionsLoading } = usePermissions(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageLoadTime = Date.now() - (performance.timeOrigin || Date.now());
    console.log(`⚡ Admin page load performance: ${pageLoadTime}ms`);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (
      session?.user &&
      !(session.user.role === "admin" || session.user.role === "super_admin")
    ) {
      console.log(
        "🔍 Non-admin user accessing admin page - redirecting to dashboard",
      );
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!isAdmin && permissionsLoading) return;

    const tabParam = searchParams.get("tab");
    if (tabParam) {
      if (isAdmin || canAccessTab(tabParam, permissions)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab("overview");
        router.replace(`/admin?tab=overview`);
      }
    } else if (!activeTab) {
      setActiveTab("overview");
    }
  }, [searchParams, permissions, permissionsLoading, router, isAdmin, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      handleTabChange(event.detail.tab);
    };

    window.addEventListener("switchTab", handleTabSwitch as EventListener);
    return () => {
      window.removeEventListener("switchTab", handleTabSwitch as EventListener);
    };
  }, []);

  const renderContent = () => {
    if (!isAdmin && !permissionsLoading && !canAccessTab(activeTab, permissions)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="ri-shield-forbid-line text-6xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don&apos;t have permission to access this section.
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <OverviewStats />
          </Suspense>
        );
      case "users":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <UserManagement />
          </Suspense>
        );
      case "roles":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <RoleManagement />
          </Suspense>
        );
      case "audit":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <AuditLog />
          </Suspense>
        );
      case "books":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ErrorBoundary fallback={<div className="p-6 text-center"><p className="text-red-600">Failed to load Book Management. Please refresh the page.</p></div>}>
              <BookManagementEnhanced />
            </ErrorBoundary>
          </Suspense>
        );
      case "reviews":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ReviewManagement />
          </Suspense>
        );
      case "orders":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <OrdersManagement />
          </Suspense>
        );
      case "shipping":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <EnhancedShippingManagement />
          </Suspense>
        );
      case "reading":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ReadingAnalytics />
          </Suspense>
        );
      case "reports":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ReportsSection />
          </Suspense>
        );
      case "email-templates":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <EmailTemplateManagement />
          </Suspense>
        );
      case "blog":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <BlogManagement />
          </Suspense>
        );
      case "works":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <WorksManagement />
          </Suspense>
        );
      case "about":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <EnhancedAboutManagement />
          </Suspense>
        );
      case "faq-management":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <FAQManagement />
          </Suspense>
        );
      case "contact":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ContactManagement />
          </Suspense>
        );
      case "footer":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <FooterManagement />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <SystemSettings />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<ComponentLoader />}>
            <OverviewStats />
          </Suspense>
        );
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen">
          <div className="w-64 bg-white border-r border-gray-200">
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-600 font-medium">
                Loading Admin Dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (
    session?.user &&
    !(session.user.role === "admin" || session.user.role === "super_admin")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-screen">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className={`admin-content ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <button
                id="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <i className="ri-menu-line text-xl"></i>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your ReadnWin platform
                </p>
              </div>
              <div className="w-8"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pl-8 min-h-full">
              <div className="hidden lg:block mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Manage your ReadnWin platform
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}