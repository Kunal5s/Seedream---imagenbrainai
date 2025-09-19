import { useEffect, useState } from "react";

export default function BlogFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchRSS() {
      try {
        const response = await fetch(
          "https://seedream-imagenbrainai.blogspot.com/feeds/posts/default?alt=rss&max-results=500"
        );
        const text = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const items = Array.from(xml.querySelectorAll("item"));

        const articles = items.map((item) => {
          const title = item.querySelector("title")?.textContent || "";
          const description = item.querySelector("description")?.textContent || "";
          const content =
            item.getElementsByTagName("content:encoded")[0]?.textContent || "";
          const pubDate = item.querySelector("pubDate")?.textContent || "";
          const categories = Array.from(item.querySelectorAll("category")).map(
            (c) => c.textContent
          );

          // extract first image from content
          let image = "";
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) image = imgMatch[1];

          return { title, description, content, pubDate, categories, image };
        });

        setPosts(articles);
      } catch (error) {
        console.error("RSS fetch error:", error);
      }
    }

    fetchRSS();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Latest Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, idx) => (
          <div key={idx} className="rounded-xl shadow-lg bg-white p-4">
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(post.pubDate).toDateString()}
            </p>
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.categories.map((cat, i) => (
                <span
                  key={i}
                  className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
