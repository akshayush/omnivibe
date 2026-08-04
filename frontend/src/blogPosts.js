const postFiles = import.meta.glob("./content/blog/*.post.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function parseFrontmatter(source, path) {
  const [, frontmatter = "", body = source] = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/) || [];
  const metadata = Object.fromEntries(
    frontmatter
      .split("\n")
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key.trim(), value.trim().replace(/^["']|["']$/g, "")]),
  );

  return {
    slug: path.split("/").pop().replace(".post.md", ""),
    title: metadata.title || "Untitled post",
    date: metadata.date || "1970-01-01",
    excerpt: metadata.excerpt || "",
    readTime: metadata.readTime || "3 min read",
    body: body.trim(),
  };
}

export const blogPosts = Object.entries(postFiles)
  .map(([path, source]) => parseFrontmatter(source, path))
  .sort((first, second) => new Date(second.date) - new Date(first.date));

export function displayDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}
