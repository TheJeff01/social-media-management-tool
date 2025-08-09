// PostNow.jsx - Reusable component for instant posting
import React, { useState } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdOutlineAttachFile } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";

function PostNow() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null); // NEW: image file

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

    if ((!postContent.trim() && !imageUrl.trim() && !imageFile) || selectedPlatforms.length === 0) {
      return;
    }

    selectedPlatforms.forEach((platform) => {
      if (platform === "Facebook") {
        const pageId = sessionStorage.getItem("fb_page_id");
        const pageToken = sessionStorage.getItem("fb_page_token");

        if (!pageId || !pageToken) {
          alert("No Facebook Page connected!");
          return;
        }

        if (imageFile) {
          // File upload via FormData to Facebook Graph API
          const formData = new FormData();
          formData.append("source", imageFile);
          formData.append("caption", postContent);
          formData.append("access_token", pageToken);

          fetch(`https://graph.facebook.com/${pageId}/photos`, {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => {
              if (!data.error) {
                console.log("✅ Facebook photo file post success:", data);
                alert("Photo file posted to Facebook!");
              } else {
                console.error("❌ Facebook file post error:", data.error);
                alert("Failed to post file to Facebook");
              }
            })
            .catch((err) => {
              console.error("❌ Network error:", err);
              alert("Network error while posting file.");
            });

        } else if (imageUrl.trim()) {
          // Post image URL
          FB.api(
            `/${pageId}/photos`,
            "POST",
            { url: imageUrl, caption: postContent, access_token: pageToken },
            function (response) {
              if (response && !response.error) {
                console.log("✅ Facebook photo URL post success:", response);
                alert("Photo URL posted to Facebook!");
              } else {
                console.error("❌ Facebook photo URL post error:", response.error);
                alert("Failed to post photo URL to Facebook");
              }
            }
          );
        } else {
          // Text-only post
          FB.api(
            `/${pageId}/feed`,
            "POST",
            { message: postContent, access_token: pageToken },
            function (response) {
              if (response && !response.error) {
                console.log("✅ Facebook text post success:", response);
                alert("Text post published to Facebook!");
              } else {
                console.error("❌ Facebook text post error:", response.error);
                alert("Failed to post text to Facebook");
              }
            }
          );
        }
      }
    });

    // Reset form after posting
    setPostContent("");
    setImageUrl("");
    setImageFile(null);
    setSelectedPlatforms([]);
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

          {/* Image URL input */}
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste an image URL (optional)"
            className="quick-post-imageurl"
          />

          {/* File upload input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="quick-post-fileinput"
          />

          <div className="quick-post-footer">
            <div className="quick-attachments">
              <button
                type="button"
                className="quick-attachment-btn"
                title="Add Image URL"
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) setImageUrl(url);
                }}
              >
                <MdOutlineImage />
              </button>
              <label
                className="quick-attachment-btn"
                title="Upload Image File"
                style={{ cursor: "pointer" }}
              >
                <MdOutlineAttachFile />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
            </div>
            <div className="quick-post-actions">
              <div className="character-count-small">
                {postContent.length}/280
              </div>
              <button
                type="submit"
                className="post-now-btn"
                disabled={
                  (!postContent.trim() && !imageUrl.trim() && !imageFile) ||
                  selectedPlatforms.length === 0
                }
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
