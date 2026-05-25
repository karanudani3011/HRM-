import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UploadPostModal from '../components/UploadPostModal';
import { Upload, Trash2, Share2, Check, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();

  const openPost = (post) => setSelectedPost(post);
  const closePost = () => setSelectedPost(null);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = [];
      snapshot.forEach((document) => {
        postsData.push({ id: document.id, ...document.data() });
      });
      setPosts(postsData);
    }, (error) => {
      console.error("Error fetching posts:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCopyLink = (post) => {
    const shareUrl = post.externalUrl || `${window.location.origin}/blog#${post.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch((err) => {
      console.error('Failed to copy link:', err);
    });
  };

  return (
    <div className="blog-page">
      <div className="blog-header-section">
        <h1>Company Blog & Updates</h1>
        <p>Stay up to date with the latest news, announcements, and articles from HRM Doctors Choice.</p>
        <button className="upload-btn primary" onClick={() => setIsModalOpen(true)}>
          <Upload size={18} />
          Upload New Post
        </button>
      </div>

      {/* ── Fullscreen Blog Detail Modal ── */}
      {selectedPost && (
        <div className="blog-detail-fullscreen-overlay">
          <button className="blog-detail-close-btn" onClick={closePost} title="Close Detail View">
            <X size={28} />
          </button>

          <div className="blog-detail-container">
            {/* Left Side: Immersive Image Viewer */}
            <div className="blog-detail-media-panel">
              {selectedPost.imageUrl ? (
                <div className="blog-detail-image-wrapper">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="blog-detail-fullscreen-image"
                    onClick={() => window.open(selectedPost.imageUrl, '_blank')}
                    title="Click to view original image in new tab"
                  />
                  <div className="blog-detail-media-hint">Click image to view original in new tab ↗</div>
                </div>
              ) : (
                <div className="blog-detail-no-image">No Image Available</div>
              )}
            </div>

            {/* Right Side: Scrollable Details Panel */}
            <div className="blog-detail-info-panel">
              <div className="blog-detail-info-content">
                <span className="blog-detail-tag">{selectedPost.category}</span>
                <h1 className="blog-detail-main-title">{selectedPost.title}</h1>

                <div className="blog-detail-meta-row">
                  <div className="blog-detail-author-avatar">
                    {selectedPost.author ? selectedPost.author.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="blog-detail-author-meta">
                    <span className="author-name">Published by {selectedPost.author || 'Administrator'}</span>
                    <span className="publish-date">{formatDate(selectedPost.createdAt)}</span>
                  </div>
                </div>

                <div className="blog-detail-divider" />

                <div className="blog-detail-body-text">
                  {selectedPost.excerpt}
                </div>

                {selectedPost.externalUrl && (
                  <div className="blog-detail-link-box">
                    <a
                      href={selectedPost.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="blog-detail-external-btn"
                    >
                      <ExternalLink size={16} />
                      Read Original Article
                    </a>
                  </div>
                )}
              </div>

              <div className="blog-detail-action-footer">
                <button
                  className={`blog-share-btn ${copiedId === selectedPost.id ? 'copied' : ''}`}
                  onClick={() => handleCopyLink(selectedPost)}
                  title="Copy Link to Share"
                >
                  {copiedId === selectedPost.id ? (
                    <>
                      <Check size={14} style={{ color: '#ffffff' }} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="blog-grid container">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="blog-card" id={post.id}>
              <div
                className="blog-image blog-image-clickable"
                style={{ backgroundImage: `url(${post.imageUrl || '/placeholder-blog.jpg'})` }}
                onClick={() => openPost(post)}
                title="Click to view full post"
              >
                <div className="blog-image-zoom-hint">🔍 View</div>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  {user && (!post.userId || post.userId === user.uid) && (
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="delete-btn"
                      title="Delete Post"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="blog-title blog-title-clickable" onClick={() => openPost(post)}>{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                {post.externalUrl && (
                  <a 
                    href={post.externalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="blog-more-link"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#4f46e5', 
                      fontSize: '0.85rem', 
                      fontWeight: '600', 
                      textDecoration: 'none',
                      marginTop: '8px',
                      marginBottom: '8px',
                      transition: 'color 0.2s' 
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#3730a3'}
                    onMouseLeave={(e) => e.target.style.color = '#4f46e5'}
                  >
                    Read More ↗
                  </a>
                )}
                
                <div className="blog-footer">
                  <div className="blog-author">
                    <div className="author-avatar">
                      {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="author-info">
                      <h4>{post.author}</h4>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <button 
                    className={`blog-share-btn ${copiedId === post.id ? 'copied' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyLink(post);
                    }}
                    title="Copy Link to Share"
                  >
                    {copiedId === post.id ? <Check size={14} style={{ color: '#ffffff' }} /> : <Share2 size={14} />}
                    <span>{copiedId === post.id ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Be the first to share an update with our community!</p>
          </div>
        )}
      </div>

      <UploadPostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Blog;
