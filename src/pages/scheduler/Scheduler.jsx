import React, { useState, useEffect } from "react";
import "./Scheduler.css";
import { BsCalendar3 } from "react-icons/bs";
import { MdScheduleSend, MdOutlineImage, MdOutlineAttachFile, MdClose } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";

function Scheduler() {
  // Form states with sessionStorage persistence
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    const stored = sessionStorage.getItem('selectedPlatforms');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [postContent, setPostContent] = useState(() => {
    const stored = sessionStorage.getItem('postContent');
    return stored || "";
  });
  
  const [scheduledDate, setScheduledDate] = useState(() => {
    const stored = sessionStorage.getItem('scheduledDate');
    return stored || "";
  });
  
  const [scheduledTime, setScheduledTime] = useState(() => {
    const stored = sessionStorage.getItem('scheduledTime');
    return stored || "";
  });
  
  const [scheduledPosts, setScheduledPosts] = useState(() => {
    const stored = sessionStorage.getItem('scheduledPosts');
    return stored ? JSON.parse(stored) : [
      {
        id: 1,
        content: "Exciting product launch coming soon! Stay tuned for updates...",
        platforms: ["Twitter", "Facebook"],
        date: "2025-08-15",
        time: "10:00 AM",
        status: "scheduled"
      },
      {
        id: 2,
        content: "Check out our latest blog post about social media trends",
        platforms: ["LinkedIn", "Twitter"],
        date: "2025-08-16",
        time: "2:30 PM",
        status: "scheduled"
      }
    ];
  });

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Save form state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));
  }, [selectedPlatforms]);

  useEffect(() => {
    sessionStorage.setItem('postContent', postContent);
  }, [postContent]);

  useEffect(() => {
    sessionStorage.setItem('scheduledDate', scheduledDate);
  }, [scheduledDate]);

  useEffect(() => {
    sessionStorage.setItem('scheduledTime', scheduledTime);
  }, [scheduledTime]);

  useEffect(() => {
    sessionStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  const platforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2" },
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2" },
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F" },
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5" }
  ];

  const togglePlatform = (platformName) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformName)
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleSchedulePost = (e) => {
    e.preventDefault();
    
    if (!postContent || !selectedPlatforms.length || !scheduledDate || !scheduledTime) {
      setNotificationMessage("Please fill all required fields!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    // Create new post
    const newPost = {
      id: Date.now(),
      content: postContent,
      platforms: [...selectedPlatforms],
      date: scheduledDate,
      time: scheduledTime,
      status: "scheduled"
    };

    // Update scheduled posts
    setScheduledPosts(prevPosts => [...prevPosts, newPost]);
    
    // Show success notification
    setNotificationMessage("Post scheduled successfully!");
    setShowNotification(true);
    
    // Reset form
    setPostContent("");
    setSelectedPlatforms([]);
    setScheduledDate("");
    setScheduledTime("");

    // Hide notification after 3 seconds
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleDeletePost = (postId) => {
    setScheduledPosts(prevPosts => 
      prevPosts.filter(post => post.id !== postId)
    );
    setNotificationMessage("Post deleted successfully!");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="scheduler-container">
      {/* Notification Popup */}
      {showNotification && (
        <div className="notification-popup">
          <div className="notification-content">
            <span>{notificationMessage}</span>
            <button 
              className="close-notification"
              onClick={() => setShowNotification(false)}
            >
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Create New Post Section */}
      <div className="scheduler-section">
        <div className="section-header">
          <div className="section-icon">
            <MdScheduleSend />
          </div>
          <h2>Create New Post</h2>
        </div>

        <form onSubmit={handleSchedulePost} className="post-form">
          {/* Platform Selection */}
          <div className="form-group">
            <label>Select Platforms</label>
            <div className="platform-grid">
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`platform-card ${selectedPlatforms.includes(platform.name) ? 'selected' : ''}`}
                  onClick={() => togglePlatform(platform.name)}
                  style={{ '--platform-color': platform.color }}
                >
                  <div className="platform-icon">
                    {platform.icon}
                  </div>
                  <span>{platform.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Post Content */}
          <div className="form-group">
            <label>Post Content</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Write your post content here..."
              className="post-textarea"
              rows="6"
              required
            />
            <div className="character-count">
              {postContent.length}/280 characters
            </div>
          </div>

          {/* Media Attachments */}
          <div className="form-group">
            <label>Attachments</label>
            <div className="attachment-options">
              <button type="button" className="attachment-btn">
                <MdOutlineImage />
                Add Image
              </button>
              <button type="button" className="attachment-btn">
                <MdOutlineAttachFile />
                Add File
              </button>
            </div>
          </div>

          {/* Schedule Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Schedule Date</label>
              <div className="input-with-icon">
                <BsCalendar3 />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="schedule-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Schedule Time</label>
              <div className="input-with-icon">
                <IoTimeOutline />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="schedule-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-draft">
              Save as Draft
            </button>
            <button type="submit" className="btn-schedule">
              <MdScheduleSend />
              Schedule Post
            </button>
          </div>
        </form>
      </div>

      {/* Scheduled Posts Section */}
      <div className="scheduler-section">
        <div className="section-header">
          <div className="section-icon">
            <BsCalendar3 />
          </div>
          <h2>Scheduled Posts</h2>
          <button className="add-post-btn">
            <AiOutlinePlus />
            Quick Add
          </button>
        </div>

        <div className="scheduled-posts-grid">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="scheduled-post-card">
              <div className="post-header">
                <div className="post-platforms">
                  {post.platforms.map((platformName) => {
                    const platform = platforms.find(p => p.name === platformName);
                    return (
                      <div
                        key={platformName}
                        className="post-platform-badge"
                        style={{ '--platform-color': platform?.color }}
                      >
                        {platform?.icon}
                      </div>
                    );
                  })}
                </div>
                <div className="post-status">
                  <span className={`status-badge ${post.status}`}>
                    {post.status}
                  </span>
                </div>
              </div>
              
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              
              <div className="post-schedule">
                <div className="schedule-info">
                  <BsCalendar3 />
                  <span>{post.date}</span>
                </div>
                <div className="schedule-info">
                  <IoTimeOutline />
                  <span>{post.time}</span>
                </div>
              </div>
              
              <div className="post-actions">
                <button className="action-btn edit">Edit</button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Scheduler;