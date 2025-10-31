import { useEffect } from "react";

export default function useMetaUpdater(meta) {
  // ✅ Helper to normalize meta data into a consistent shape
  const normalizeMeta = (meta) => {
    if (!meta) return null;

    // Case 1 → API gives full `metaData` object
    if (meta?.title || meta?.description || meta?.image) {
      return {
        title: meta?.title || meta?.name || "",
        description: meta?.description || "",
        image: meta?.image || "",
        category_type: meta?.category_type || "website",
      };
    }

    // Case 2 → API gives flat fields: meta_title, meta_description, meta_image
    return {
      title: meta?.meta_title || "",
      description: meta?.meta_description || "",
      image: meta?.meta_image || "",
      category_type: meta?.category_type || "website",
    };
  };

  // ✅ Build full image URL if needed
  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  useEffect(() => {
    if (!meta) return;

    const resolvedMeta = normalizeMeta(meta);
    if (!resolvedMeta) return;

    // ✅ Update <title>
    if (resolvedMeta.title) {
      document.title = resolvedMeta.title;
    }

    // ✅ Update <meta name="description">
    let descTag = document.querySelector("meta[name='description']");
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", resolvedMeta.description || "");

    // ✅ Build full image URL
    const imageUrl = getImageSrc(resolvedMeta.image);

    // ✅ Update Open Graph tags
    const ogTags = [
      { property: "og:type", content: resolvedMeta.category_type },
      { property: "og:title", content: resolvedMeta.title },
      { property: "og:description", content: resolvedMeta.description },
      { property: "og:image", content: imageUrl },
      { property: "og:url", content: window.location.href },
      { property: "og:site_name", content: "Yuukke Marketplace" },
    ];

    ogTags.forEach(({ property, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property='${property}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // ✅ Update Twitter Card tags
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: resolvedMeta.title },
      { name: "twitter:description", content: resolvedMeta.description },
      { name: "twitter:image", content: imageUrl },
    ];

    twitterTags.forEach(({ name, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name='${name}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });
  }, [meta]);
}
