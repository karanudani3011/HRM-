import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import UploadPostModal from '../components/UploadPostModal';
import { Upload } from 'lucide-react';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <div key={post.id} className="blog-card">
              <div 
                className="blog-image" 
                style={{ backgroundImage: `url(${post.imageUrl || '/placeholder-blog.jpg'})` }}
              ></div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                
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
