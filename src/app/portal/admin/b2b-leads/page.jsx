import B2BLeadsManager from "@/components/b2b/B2BLeadsManager";

export default function AdminB2BLeadsPage() {
  return (
    <B2BLeadsManager
      apiBase="/api/admin/b2b-leads"
      title="Clientes B2B"
      subtitle="Consulta, clasifica y da seguimiento a las solicitudes comerciales."
    />
  );
}