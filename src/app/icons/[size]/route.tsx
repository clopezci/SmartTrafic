import { brandIcon } from "@/lib/brand-icon";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const n = Number(size);
  if (n !== 192 && n !== 512) {
    return new Response("Not found", { status: 404 });
  }
  const maskable = new URL(req.url).searchParams.has("maskable");
  return brandIcon(n, maskable);
}
