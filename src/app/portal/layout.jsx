export const dynamic = "force-dynamic";

export default function PortalLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {children}
    </div>
  );
}
