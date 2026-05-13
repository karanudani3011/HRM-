import React, { useState } from 'react';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './UploadPostModal.css';

const UploadPostModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);

      // 2. Save post data to Firebase Firestore
      await addDoc(collection(db, 'posts'), {
        title,
        category,
        excerpt,
        author,
        imageUrl,
        userId: user ? user.uid : null,
        createdAt: serverTimestamp(),
      });

      // 3. Reset form and close modal
      setTitle('');
      setCategory('');
      setExcerpt('');
      setAuthor('');
      setFile(null);
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="file-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Category (e.g., Health & Wellness)</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="Health & Wellness"
              required 
            />
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="5 Simple Daily Habits..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Excerpt / Content</label>
            <textarea 
              value={excerpt} 
              onChange={(e) => setExcerpt(e.target.value)} 
              placeholder="Small changes in your daily routine..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Author Name</label>
            <input 
              type="text" 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              placeholder="HealthyLife Clinic"
              required 
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPostModal;
