import { z } from "zod";
const word = z.string().trim().min(1).max(48);
export const article = z
  .object({
    title: z.string().trim().min(1).max(160),
    slug: z
      .string()
      .max(150)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase words separated by hyphens",
      ),
    excerpt: z.string().trim().min(1).max(400),
    content: z.string().trim().min(1).max(65000),
    cover: z
      .string()
      .max(2000)
      .refine(
        (v) =>
          /^\/art\/(observe|shape|build|launch)\.svg$/.test(v) ||
          (/^https:\/\//.test(v) && URL.canParse(v)),
        "Choose a studio cover or enter an HTTPS image URL",
      ),
    category: word,
    tags: z
      .array(word)
      .max(12)
      .transform((a) => [...new Set(a)]),
    status: z.enum(["draft", "published"]),
  })
  .strict();
export type Fields = z.output<typeof article>;
export type Post = Fields & {
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  version: number;
};
export function decode(row: any): Post {
  return { ...row, tags: JSON.parse(row.tags) };
}
export function values(p: Fields) {
  return [
    p.title,
    p.slug,
    p.excerpt,
    p.content,
    p.cover,
    p.category,
    JSON.stringify(p.tags),
    p.status,
  ];
}
export const columns = "title,slug,excerpt,content,cover,category,tags,status";
export const insertSql =
  "INSERT INTO posts (" +
  columns +
  ",id,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
