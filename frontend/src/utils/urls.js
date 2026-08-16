export function slugify(input, fallback = 'post') {
  if (!input || !String(input).trim()) {
    return fallback;
  }
  let slug = String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length > 80) {
    slug = slug.slice(0, 80).replace(/-+$/g, '');
  }
  if (!slug) {
    slug = fallback;
  }
  return slug;
}

export function postPath(post) {
  if (!post) return '/';
  const slug = post.slug || post.postSlug;
  if (slug) {
    return `/posts/${slug}`;
  }
  const id = post.id || post.postId;
  return id ? `/posts/${id}` : '/';
}

export function categoryPath(category) {
  if (!category) return '/';
  if (typeof category === 'string') {
    return `/category/${slugify(category, 'category')}`;
  }
  if (category.slug) {
    return `/category/${category.slug}`;
  }
  if (category.name) {
    return `/category/${slugify(category.name, 'category')}`;
  }
  return '/';
}

export function findCategory(categories, key) {
  if (!key || !Array.isArray(categories)) return null;
  const needle = String(key).toLowerCase();
  return categories.find((cat) =>
    (cat.slug && cat.slug.toLowerCase() === needle) ||
    (cat.name && cat.name.toLowerCase() === needle)
  ) || null;
}
