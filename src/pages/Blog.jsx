import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UploadPostModal from '../components/UploadPostModal';
import { Upload, Trash2, Share2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { user } = useAuth();

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

      <div className="blog-grid container">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="blog-card" id={post.id}>
              <div 
                className="blog-image" 
                style={{ backgroundImage: `url(${post.imageUrl || '/placeholder-blog.jpg'})` }}
              ></div>
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
                <h3 className="blog-title">{post.title}</h3>
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
