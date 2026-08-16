import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getPosts } from '../services/api';
import { SITEMAP_XML_URL } from '../config';
import { categoryPath, postPath } from '../utils/urls';
import SEO from './SEO';
import '../App.css';

function SitemapPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [postsResponse, categoriesResponse] = await Promise.all([
          getPosts(),
          getCategories()
        ]);
        const postList = postsResponse.data.content || postsResponse.data || [];
        setPosts(postList);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Failed to load sitemap:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="sitemap-page card">
      <SEO
        title="Sitemap | lladlad"
        description="Browse every category and published post on lladlad."
        url={`${window.location.origin}/sitemap`}
      />
      <h1>Sitemap</h1>
      <p className="sitemap-intro">
        Find categories and posts on lladlad. Search engines can also use the{' '}
        <a href={SITEMAP_XML_URL} target="_blank" rel="noopener noreferrer">XML sitemap</a>.
      </p>

      {loading ? (
        <p>Loading sitemap...</p>
      ) : (
        <>
          <h2>Categories</h2>
          <ul className="sitemap-list">
            <li><Link to="/">Home</Link></li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={categoryPath(category)}>{category.name}</Link>
              </li>
            ))}
          </ul>

          <h2>Posts</h2>
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <ul className="sitemap-list">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link to={postPath(post)}>{post.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default SitemapPage;
