import handler from "vinext/server/fetch-handler";
import { api } from "../src/api";
export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    if (new URL(request.url).pathname.startsWith("/api/"))
      return api(request, env);
    return handler.fetch(request, env, ctx);
  },
};
