import B2BLeadsManager from "@/components/b2b/B2BLeadsManager";

export default function SuperAdminB2BLeadsPage() {
  return (
    <B2BLeadsManager
      apiBase="/api/superadmin/b2b-leads"
      title="Clientes B2B"
      subtitle="Vista general de clientes comerciales para seguimiento y control."
    />
  );
}