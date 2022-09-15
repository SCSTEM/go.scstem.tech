export const onRequestGet: PagesFunction<{ KV_LINKS: KVNamespace }> = async ({
  request,
  env,
}) => {
  const url = new URL(request.url);

  const links = (await env.KV_LINKS.list()).keys.map(async (value) => {
    return await env.KV_LINKS.getWithMetadata(value.name);
  });

  if (links.length === 0)
    return new Response("No shortlinks found", { status: 404 });

  if (url.searchParams.get("pretty") === "1")
    return new Response(JSON.stringify(links, null, 2));
  return new Response(JSON.stringify(links));
};
