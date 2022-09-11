export const onRequestGet: PagesFunction<{
  KV_LINKS: KVNamespace;
  CONST_DEFAULT: string;
}> = async ({ env, params }) => {
  let code = params.code;
  if (Array.isArray(code)) code = params.code[0];

  const redirect = await env.KV_LINKS.get(code);
  if (redirect === null || !isURL(redirect))
    return Response.redirect(env.CONST_DEFAULT);
  return Response.redirect(redirect);
};

const isURL = (test: string) => {
  let url: URL;
  try {
    url = new URL(test);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};
