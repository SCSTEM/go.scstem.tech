import type { Shortlink, APIResponse } from "../../types";

export const onRequest: PagesFunction<{ KV_LINKS: KVNamespace }> = async ({
  env,
  request,
}) => {
  const body: Shortlink = await request.json();

  // Make sure the request is good before continuing
  const error = await checkRequest(body).catch((error) => error);
  if (error)
    return response(
      { success: false, message: "Bad Request", error: error },
      400
    );

  const shortlink = await env.KV_LINKS.getWithMetadata(body.code)
    .then((link) => {
      const sl: Shortlink = {
        code: body.code,
        url: new URL(link.value),
        date: link.metadata["dateTime"],
      };
      return sl;
    })
    .catch(() => undefined);

  // Process request based on method
  switch (request.method) {
    case "POST":
      // Make sure code does not already exist
      if (shortlink)
        return response(
          {
            success: false,
            message: `Code \`${shortlink.code}\` already exists.`,
          },
          400
        );

      // Add the code and URL to the KV
      return env.KV_LINKS.put(shortlink.code, shortlink.url.toString(), {
        metadata: { dateTime: new Date().getUTCDate() },
      })
        .then(() => response({ success: true, result: shortlink }, 200))
        .catch((e) =>
          response(
            {
              success: false,
              message: "Problem writing shortlink to KV store",
              error: e,
            },
            500
          )
        );

    case "DELETE":
      // Make sure code exists
      if (!shortlink)
        return response(
          { success: false, message: `Code \`${shortlink.code}\` not found.` },
          400
        );

      // Delete the key value pair
      const delError = await env.KV_LINKS.delete(shortlink.code).catch((e) =>
        response(
          {
            success: false,
            message: "Problem deleting shortlink from KV store",
            error: e,
          },
          500
        )
      );

      // Return if delete attempt failed
      if (delError) return delError;

      // Add the code and URL to the KV
      return env.KV_LINKS.put(shortlink.code, shortlink.url.toString(), {
        metadata: { dateTime: new Date().getUTCDate() },
      })
        .then(() => response({ success: true, result: shortlink }, 200))
        .catch((e) =>
          response(
            {
              success: false,
              message: "Problem writing shortlink to KV store",
              error: e,
            },
            500
          )
        );

    case "PATCH":
      // Make sure code exists
      if (!shortlink)
        return response(
          { success: false, message: `Code \`${shortlink.code}\` not found.` },
          400
        );

      // Delete the existing link
      await env.KV_LINKS.delete(shortlink.code)
        .then(() => response({ success: true, result: shortlink }, 200))
        .catch((error) =>
          response(
            {
              success: false,
              message: "Problem deleting shortlink from KV store",
              error: error,
            },
            500
          )
        );
    case "GET":
    default:
      response({ success: true, result: shortlink }, 200);
  }
};

/**
 * Helper function to check requests before processing. Checks to ensure a URL and code is provided,
 * as well as making sure the request itself matches the correct type
 * @param sl The Shortlink request
 * @returns A Promise that will be rejected if the request does not the appropriate parameters
 */
const checkRequest = async (sl: Shortlink): Promise<void> => {
  // Make sure a request body was provided
  if (!sl) return Promise.reject("Request body not valid");

  // Make sure a URL was provided
  if (!sl.url) return Promise.reject("You must supply a URL to shorten");

  // Make sure a code was provided
  if (!sl.code)
    return Promise.reject("You must supply a code to associate with this URL");
};

/**
 * Helper function to generate response message to return to the client. Helps standardize
 * communication and error logging between API and web frontend.
 * @param apiResponse A standardized response object, shared between the API and web frontend
 * @param status HTTP status code
 * @returns A standard HTTP Response object
 */
const response = (apiResponse: APIResponse, status: number): Response => {
  if (!apiResponse.success) console.error(apiResponse.error?.message);

  return new Response(JSON.stringify(apiResponse), {
    status: status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};