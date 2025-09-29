// pages/Blog.tsx - YEH PURI FILE REPLACE KARO

import { useEffect, useState } from 'react';
import { fetchArticles, clearCache, BlogPost } from '../data/blogData';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const postsPerPage = 100;
  const totalPages = Math.ceil(totalResults / postsPerPage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPosts(currentPage);
  }, [currentPage]);

  const loadPosts = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchArticles({ 
        page: pageNum, 
        limit: postsPerPage 
      });
      
      setPosts(response.posts);
      setTotalResults(response.totalResults);
      
    } catch (err) {
      setError('Failed to load articles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const refresh = () => {
    clearCache();
    loadPosts(currentPage);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startPost = (currentPage - 1) * postsPerPage + 1;
  const endPost = Math.min(currentPage * postsPerPage, totalResults);

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog Articles</h1>
        <div className="blog-info">
          <p>Showing {startPost}-{endPost} of {totalResults} articles</p>
          <button onClick={refresh} disabled={loading} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading articles...</div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post.slug} className="post-card">
                {post.featuredImage && (
                  <img src={post.featuredImage} alt={post.title} />
                )}
                <h2>{post.title}</h2>
                <p className="excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span className="date">
                    {new Date(post.published).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {post.categories.length > 0 && (
                    <span className="categories">
                      {post.categories.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
                <a href={`#/blog/${post.slug}`} className="read-more">
                  Read More →
                </a>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-footer">
              <button
                className="pagination-btn"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              
              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="page-ellipsis">
                      {page}
                    </span>
                  )
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>

              <button
                className="pagination-btn"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>

              <div className="page-jump">
                <span>Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="page-input"
                />
                <span>of {totalPages}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}/* styles/blog.css - YEH CSS FILE MEIN ADD KARO (Ya naye blog.css file banao) */

.blog-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.blog-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.blog-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.blog-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 15px;
}

.blog-info p {
  color: #666;
  font-size: 1rem;
}

.refresh-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #218838;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.post-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.post-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.post-card h2 {
  font-size: 1.3rem;
  margin: 16px 16px 12px;
  color: #333;
  line-height: 1.4;
}

.post-card .excerpt {
  padding: 0 16px;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  flex-grow: 1;
}

.post-meta {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #999;
  border-top: 1px solid #f0f0f0;
}

.post-meta .date {
  font-weight: 500;
}

.post-meta .categories {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.read-more {
  display: inline-block;
  padding: 12px 16px;
  margin: 0 16px 16px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  transition: background 0.2s;
  font-weight: 500;
}

.read-more:hover {
  background: #0056b3;
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 80px 20px;
  color: #666;
  font-size: 1.2rem;
}

.pagination-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  background: #e9ecef;
  cursor: not-allowed;
  opacity: 0.5;
}

.page-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-number {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
}

.page-number:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.page-number.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-ellipsis {
  padding: 0 8px;
  color: #6c757d;
  font-weight: 500;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid #dee2e6;
  color: #495057;
  font-size: 14px;
}

.page-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.page-input:focus {
  outline: none;
  border-color: #007bff;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .pagination-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-jump {
    border-left: none;
    border-top: 1px solid #dee2e6;
    padding-top: 16px;
    padding-left: 0;
    margin-left: 0;
  }
  
  .blog-info {
    flex-direction: column;
    gap: 10px;
  }
}
