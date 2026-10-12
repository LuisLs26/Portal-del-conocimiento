/// <reference types="@cloudflare/workers-types" />
// Cloudflare Pages: bind MARATON_SERVICE to the portal-maraton Worker.
export const onRequest: PagesFunction<{ MARATON_SERVICE?: Fetcher }> = async ({ request, env }) => {
  if (!env.MARATON_SERVICE) return Response.json({ error: 'La Maratón todavía no está disponible. Consulta al docente.' }, { status: 503 });
  return env.MARATON_SERVICE.fetch(request);
};
