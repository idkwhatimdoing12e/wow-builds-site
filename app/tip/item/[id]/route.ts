// /tip/item/<id>: one item's tooltip as JSON, written out as a static file at
// build time. The hover tooltip (ItemTooltips) fetches it on first hover.
import { getItemById, getItemIds, itemTip } from "@/app/lib/item-index";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getItemIds().map((id) => ({ id: String(id) }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItemById(Number(id));
  if (!item) return new Response("Not found", { status: 404 });
  return Response.json(itemTip(item));
}
