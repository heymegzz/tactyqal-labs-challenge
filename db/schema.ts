import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    cover: text("cover").notNull(),
    category: text("category").notNull(),
    tags: text("tags").notNull(),
    status: text("status", { enum: ["draft", "published"] }).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    publishedAt: text("published_at"),
    version: integer("version").notNull().default(1),
  },
  (t) => [
    uniqueIndex("posts_slug").on(t.slug),
    index("posts_feed").on(t.status, t.publishedAt),
  ],
);
export const flags = sqliteTable("initializations", {
  name: text("name").primaryKey(),
});
