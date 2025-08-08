// PostNow.jsx - Reusable component for instant posting
import React, { useState } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdOutlineAttachFile } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";

function PostNow() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const platforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2" },
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2" },
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F" },
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5" },
  ];

  const togglePlatform = (platformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformName)
        ? prev.filter((p) => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handlePostNow = (e) => {
    e.preventDefault();

    if (!postContent.trim() || selectedPlatforms.length === 0) {
      return;
    }

    // Handle immediate posting logic here
    console.log({
      content: postContent,
      platforms: selectedPlatforms,
      action: "post_now",
      timestamp: new Date().toISOString(),
    });

    // Reset form after posting
    setPostContent("");
    setSelectedPlatforms([]);

    // You could add a success notification here
    alert("Post shared successfully!");
  };

  return (
    <div className="post-now-section">
      <div className="post-now-header">
        <div className="post-now-icon">
          <IoFlashOutline />
        </div>
        <div className="post-now-title">
          <h2>What's happening?</h2>
          <p>Share your thoughts instantly across your social platforms</p>
        </div>
      </div>

      <form onSubmit={handlePostNow} className="quick-post-form">
        {/* Quick Platform Selection */}
        <div className="quick-platforms">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`quick-platform ${
                selectedPlatforms.includes(platform.name) ? "selected" : ""
              }`}
              onClick={() => togglePlatform(platform.name)}
              style={{ "--platform-color": platform.color }}
              title={`Post to ${platform.name}`}
            >
              {platform.icon}
            </div>
          ))}
        </div>

        {/* Quick Post Content */}
        <div className="quick-post-content">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind? Share it with the world right now..."
            className="quick-post-textarea"
            rows="4"
            maxLength="280"
          />
          <div className="quick-post-footer">
            <div className="quick-attachments">
              <button
                type="button"
                className="quick-attachment-btn"
                title="Add Image"
              >
                <MdOutlineImage />
              </button>
              <button
                type="button"
                className="quick-attachment-btn"
                title="Add File"
              >
                <MdOutlineAttachFile />
              </button>
            </div>
            <div className="quick-post-actions">
              <div className="character-count-small">
                {postContent.length}/280
              </div>
              <button
                type="submit"
                className="post-now-btn"
                disabled={!postContent.trim() || selectedPlatforms.length === 0}
              >
                <MdSend />
                Post Now
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PostNow;
