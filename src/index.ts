export interface Env {
  KV_LINKS: KVNamespace;
  DEFAULT_URL: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      const code = new URL(req.url).pathname.replace("/", "");
      const url = await getRedirect(env.KV_LINKS, code);

      return Response.redirect(url.toString());
    } catch (_) {
      return Response.redirect(env.DEFAULT_URL);
    }
  },
};

const getRedirect = async (kv: KVNamespace, code: string): Promise<URL> => {
  try {
    // Get the link from the KV store
    const link = await kv.get(code);
    if (link === null) return Promise.reject();

    // Attempt to convert it to a URL, if it can't be converted,
    // assume that code is reserved and reject
    const url = new URL(link);

    return Promise.resolve(url);
  } catch (_) {
    // No need to error, just ignore the request
    return Promise.reject();
  }
};
