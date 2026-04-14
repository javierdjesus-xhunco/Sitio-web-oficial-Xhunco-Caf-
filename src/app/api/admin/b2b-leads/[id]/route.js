export async function PATCH(req, { params }) {
  const auth = await requirePortalRole(["admin", "super_admin"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const status = clean(body?.status);
  const notes = clean(body?.notes);

  if (!ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Estatus inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("b2b_leads")
    .update({
      status,
      notes: notes || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("PATCH admin b2b lead error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el lead." },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: data });
}