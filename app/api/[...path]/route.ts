import { env } from "cloudflare:workers";
import { api } from "@/src/api";
export const dynamic = "force-dynamic";
async function route(request: Request) {
  return api(request, env);
}
export {
  route as GET,
  route as POST,
  route as PUT,
  route as DELETE,
  route as PATCH,
};
