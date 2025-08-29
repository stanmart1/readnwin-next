export default function NotificationCenter() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center py-8">
        <i className="ri-notification-off-line text-4xl text-gray-400 mb-3"></i>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Notifications Disabled
        </h3>
        <p className="text-gray-600 text-sm">
          The notification center has been removed from the dashboard.
        </p>
      </div>
    </div>
  );
}