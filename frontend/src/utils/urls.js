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

/** Fallback when /api/categories is empty or unavailable — keeps nav usable. */
export const CORE_NAV_CATEGORIES = [
  { name: 'Books', slug: 'books' },
  { name: 'Movies', slug: 'movies' },
  { name: 'Tech', slug: 'tech' },
  { name: 'Dharma', slug: 'dharma' },
  { name: 'Gaming', slug: 'gaming' },
];

export function resolveHeaderCategories(categories) {
  const baseOrder = CORE_NAV_CATEGORIES.map((c) => c.name);
  const source = Array.isArray(categories) && categories.length > 0
    ? categories
    : CORE_NAV_CATEGORIES;

  const base = source
    .filter((c) => baseOrder.includes(c.name))
    .sort((a, b) => baseOrder.indexOf(a.name) - baseOrder.indexOf(b.name));
  const extra = source
    .filter((c) => !baseOrder.includes(c.name) && c.showInHeader)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return [...base, ...extra];
}
