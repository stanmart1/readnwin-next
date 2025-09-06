import { Suspense } from "react";
import AdminContent from "./AdminContent";
import Header from "@/components/Header";

function AdminFallback() {
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

export default function AdminDashboard() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminContent />
    </Suspense>
  );
}
