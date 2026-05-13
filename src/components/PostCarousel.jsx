import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import './PostCarousel.css';

const PostCarousel = () => {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch posts from Firestore
  useEffect(() => {
    if (!db) return; // Guard in case Firebase failed to initialize

    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    
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

  // Auto-slide effect (every 25 seconds)
  useEffect(() => {
    if (posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 25000); // 25 seconds

    return () => clearInterval(interval);
  }, [posts.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        // If we deleted the last post, we might need to adjust currentIndex
        if (currentIndex >= posts.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
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

  return (
    <section className="post-carousel-section">
      <div className="carousel-header">
        <h2>Latest Posts from Our Clients</h2>
      </div>

      <div className="carousel-container">
        {posts.length > 0 ? (
          <>
            <button className="nav-arrow left" onClick={handlePrev}>
              <ChevronLeft size={24} />
            </button>

            <div className="carousel-content">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={`post-card ${index === currentIndex ? 'active' : ''}`}
                >
                  <div 
                    className="post-image" 
                    style={{ backgroundImage: `url(${post.imageUrl})` }}
                  ></div>
                  <div className="post-info">
                    <div className="post-info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="post-category">{post.category}</span>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="delete-post-btn"
                        title="Delete Post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-excerpt">{post.excerpt}</p>
                    
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="author-details">
                        <h4>{post.author}</h4>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="nav-arrow right" onClick={handleNext}>
              <ChevronRight size={24} />
            </button>
          </>
        ) : (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Be the first to share an update with our community!</p>
          </div>
        )}
      </div>

      {posts.length > 1 && (
        <div className="carousel-dots">
          {posts.map((_, index) => (
            <button 
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PostCarousel;
