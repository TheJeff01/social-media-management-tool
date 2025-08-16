// Updated PostNow.jsx with Real OAuth Integration
import React, { useState } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdClose } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { useToast } from "../Toast/ToastProvider";

function PostNow() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const { showToast } = useToast();

  // All available platforms with their details
  const allPlatforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2" },
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2" },
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F" },
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5" },
  ];

  // Load connected accounts from sessionStorage on component mount
  React.useEffect(() => {
    const loadConnectedAccounts = () => {
      const accounts = [];
      
      // Check Facebook
      const fbPageId = sessionStorage.getItem("fb_page_id");
      const fbPageToken = sessionStorage.getItem("fb_page_token");
      const fbPageName = sessionStorage.getItem("fb_page_name");
      
      if (fbPageId && fbPageToken) {
        accounts.push({
          id: 'facebook_' + fbPageId,
          platform: "Facebook",
          username: fbPageName || "Facebook Page",
          displayName: fbPageName || "Facebook Page",
          status: "active"
        });
      }
      
      // Check Twitter
      const twitterToken = sessionStorage.getItem("twitter_access_token");
      const twitterUserId = sessionStorage.getItem("twitter_user_id");
      const twitterUsername = sessionStorage.getItem("twitter_username");
      const twitterDisplayName = sessionStorage.getItem("twitter_display_name");
      
      if (twitterToken && twitterUserId) {
        accounts.push({
          id: 'twitter_' + twitterUserId,
          platform: "Twitter",
          username: twitterUsername || "@twitter_user",
          displayName: twitterDisplayName || "Twitter User",
          status: "active"
        });
      }
      
      // Check LinkedIn
      const linkedinToken = sessionStorage.getItem("linkedin_access_token");
      const linkedinUserId = sessionStorage.getItem("linkedin_user_id");
      const linkedinUsername = sessionStorage.getItem("linkedin_username");
      const linkedinDisplayName = sessionStorage.getItem("linkedin_display_name");
      
      if (linkedinToken && linkedinUserId) {
        accounts.push({
          id: 'linkedin_' + linkedinUserId,
          platform: "LinkedIn",
          username: linkedinUsername || "LinkedIn User",
          displayName: linkedinDisplayName || "LinkedIn User",
          status: "active"
        });
      }
      
      setConnectedAccounts(accounts);
      console.log("📱 Connected accounts loaded:", accounts);
    };

    loadConnectedAccounts();
  }, []);

  // Get only connected platforms
  const getConnectedPlatforms = () => {
    return allPlatforms.filter(platform => 
      connectedAccounts.some(account => account.platform === platform.name)
    );
  };

  const connectedPlatforms = getConnectedPlatforms();

  const togglePlatform = (platformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformName)
        ? prev.filter((p) => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear image URL if file is selected
      setImageUrl("");
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url) {
      setImagePreview(url);
      setImageFile(null); // Clear file if URL is provided
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    
    // Reset file input
    const fileInput = document.querySelector('.image-file-input');
    if (fileInput) fileInput.value = '';
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  // =====================
  // REAL TWITTER POSTING WITH OAUTH
  // =====================
  const postToTwitter = async (content, imageUrl = null, imageFile = null) => {
    const accessToken = sessionStorage.getItem("twitter_access_token");
    const userId = sessionStorage.getItem("twitter_user_id");

    if (!accessToken || !userId) {
      throw new Error("Twitter not connected. Please connect your account first.");
    }

    try {
      console.log("🐦 Posting to Twitter...", { content, imageUrl: !!imageUrl, imageFile: !!imageFile });

      let mediaId = null;

      // Handle image upload if provided
      if (imageFile || imageUrl) {
        console.log("📸 Uploading media to Twitter...");
        try {
          mediaId = await uploadTwitterMedia(imageFile, imageUrl, accessToken);
          console.log("✅ Twitter media uploaded:", mediaId);
        } catch (mediaError) {
          console.warn("⚠️ Twitter media upload failed:", mediaError);
          // Continue without image
        }
      }

      // Create tweet payload
      const tweetPayload = {
        text: content,
      };

      // Add media if available
      if (mediaId) {
        tweetPayload.media = {
          media_ids: [mediaId],
        };
      }

      console.log("📤 Sending tweet:", tweetPayload);

      // Post tweet using Twitter API v2
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetPayload),
      });

      const result = await response.json();
      console.log("📋 Twitter API response:", result);

      if (response.ok && result.data) {
        console.log("✅ Tweet posted successfully:", result.data.id);
        return {
          success: true,
          data: result.data,
          tweetId: result.data.id,
          message: "Tweet posted successfully!",
        };
      } else {
        // Handle Twitter API errors
        const errorMessage = result.detail || 
                           result.errors?.[0]?.message || 
                           result.error ||
                           "Failed to post tweet";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Twitter post error:", error);
      throw error;
    }
  };

  // Twitter media upload function
  const uploadTwitterMedia = async (imageFile, imageUrl, accessToken) => {
    try {
      let mediaData;

      if (imageFile) {
        // Upload file directly
        const formData = new FormData();
        formData.append("media", imageFile);
        formData.append("media_category", "tweet_image");

        const uploadResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
          body: formData,
        });

        mediaData = await uploadResponse.json();
      } else if (imageUrl) {
        // For URL-based images, fetch and convert to blob first
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();

        const formData = new FormData();
        formData.append("media", imageBlob);
        formData.append("media_category", "tweet_image");

        const uploadResponse = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
          body: formData,
        });

        mediaData = await uploadResponse.json();
      }

      if (mediaData && mediaData.media_id_string) {
        return mediaData.media_id_string;
      } else {
        throw new Error("Failed to upload media to Twitter");
      }
    } catch (error) {
      console.error("Twitter media upload error:", error);
      throw new Error(`Media upload failed: ${error.message}`);
    }
  };

  // =====================
  // REAL LINKEDIN POSTING WITH OAUTH
  // =====================
  const postToLinkedIn = async (content, imageUrl = null, imageFile = null) => {
    const accessToken = sessionStorage.getItem("linkedin_access_token");
    const userId = sessionStorage.getItem("linkedin_user_id");

    if (!accessToken || !userId) {
      throw new Error("LinkedIn not connected. Please connect your account first.");
    }

    try {
      console.log("💼 Posting to LinkedIn...", { content, imageUrl: !!imageUrl, imageFile: !!imageFile });

      // For now, post text-only to LinkedIn
      // LinkedIn image posting requires more complex media upload process
      const postPayload = {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      };

      console.log("📤 Sending LinkedIn post:", postPayload);

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postPayload),
      });

      const result = await response.json();
      console.log("📋 LinkedIn API response:", result);

      if (response.ok && result.id) {
        console.log("✅ LinkedIn post successful:", result.id);
        return {
          success: true,
          data: result,
          postId: result.id,
          message: "LinkedIn post published successfully!",
        };
      } else {
        const errorMessage = result.message || 
                           result.error_description || 
                           "Failed to post to LinkedIn";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ LinkedIn post error:", error);
      throw error;
    }
  };

  // =====================
  // MAIN POSTING HANDLER
  // =====================
  const handlePostNow = async (e) => {
    e.preventDefault();

    if ((!postContent.trim() && !imageUrl.trim() && !imageFile) || selectedPlatforms.length === 0) {
      return;
    }

    setIsPosting(true);

    try {
      let postsSuccessful = 0;
      let postsFailed = 0;

      for (const platform of selectedPlatforms) {
        try {
          if (platform === "Twitter") {
            await postToTwitter(postContent, imageUrl, imageFile);
            postsSuccessful++;
            showSuccess(`🐦 Tweet posted successfully!`);
          } 
          else if (platform === "LinkedIn") {
            await postToLinkedIn(postContent, imageUrl, imageFile);
            postsSuccessful++;
            showSuccess(`💼 LinkedIn post published successfully!`);
          }
          else if (platform === "Facebook") {
            const pageId = sessionStorage.getItem("fb_page_id");
            const pageToken = sessionStorage.getItem("fb_page_token");

            if (!pageId || !pageToken) {
              throw new Error("No Facebook Page connected!");
            }

            if (imageFile) {
              // File upload via FormData to Facebook Graph API
              const formData = new FormData();
              formData.append("source", imageFile);
              formData.append("caption", postContent);
              formData.append("access_token", pageToken);

              const response = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
                method: "POST",
                body: formData,
              });

              const data = await response.json();

              if (!data.error) {
                postsSuccessful++;
                showSuccess(`📘 Photo successfully posted to Facebook!`);
              } else {
                throw new Error(data.error.message);
              }
            } else if (imageUrl.trim()) {
              // Post image URL using FB SDK
              if (typeof FB !== 'undefined') {
                FB.api(
                  `/${pageId}/photos`,
                  "POST",
                  { url: imageUrl, caption: postContent, access_token: pageToken },
                  function (response) {
                    if (response && !response.error) {
                      postsSuccessful++;
                      showSuccess(`📘 Photo successfully posted to Facebook!`);
                    } else {
                      postsFailed++;
                      showToast({ message: "Failed to post photo URL to Facebook", type: "error" });
                    }
                  }
                );
              }
            } else {
              // Text-only post using FB SDK
              if (typeof FB !== 'undefined') {
                FB.api(
                  `/${pageId}/feed`,
                  "POST",
                  { message: postContent, access_token: pageToken },
                  function (response) {
                    if (response && !response.error) {
                      postsSuccessful++;
                      showSuccess(`📘 Post successfully published to Facebook!`);
                    } else {
                      postsFailed++;
                      showToast({ message: "Failed to post text to Facebook", type: "error" });
                    }
                  }
                );
              }
            }
          } 
          else {
            // For other platforms (Instagram, etc.) - show coming soon
            showToast({ message: `${platform} posting coming soon!`, type: "info" });
          }
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          postsFailed++;
          showToast({ 
            message: `Failed to post to ${platform}: ${error.message}`, 
            type: 'error' 
          });
        }
      }

      // Show summary message if multiple platforms
      if (selectedPlatforms.length > 1) {
        setTimeout(() => {
          if (postsSuccessful > 0) {
            showSuccess(`🚀 Successfully posted to ${postsSuccessful}/${selectedPlatforms.length} platforms!`);
          }
        }, 500);
      }

      // Reset form after successful posting
      if (postsSuccessful > 0) {
        setPostContent("");
        setImageUrl("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedPlatforms([]);
      }

    } catch (error) {
      console.error('Error posting:', error);
      showToast({ message: 'Failed to post. Please try again.', type: 'error' });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      {/* Success Notification */}
      {showSuccessMessage && (
        <div className="success-notification">
          <div className="success-content">
            <div className="success-icon">✨</div>
            <span>{successMessage}</span>
            <button 
              className="close-success"
              onClick={() => setShowSuccessMessage(false)}
            >
              <MdClose />
            </button>
          </div>
          <div className="success-progress"></div>
        </div>
      )}

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
          {connectedPlatforms.length > 0 ? (
            <div className="quick-platforms">
              {connectedPlatforms.map((platform) => (
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
          ) : (
            <div className="no-accounts-message">
              <div className="no-accounts-content">
                <div className="no-accounts-icon">🔗</div>
                <div className="no-accounts-text">
                  <h3>No Connected Accounts</h3>
                  <p>Connect your social media accounts to start posting instantly</p>
                  <a href="/accounts" className="connect-accounts-link">
                    Connect Accounts
                  </a>
                </div>
              </div>
            </div>
          )}

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

            {/* Image Upload Section */}
            <div className="image-upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="image-file-input"
                id="imageUpload"
              />
              
              <input
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Or paste an image URL here..."
                className="image-url-input"
              />
              
              <label htmlFor="imageUpload" className="image-upload-label">
                <MdOutlineImage />
                Choose Image File
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    onClick={openImageModal}
                    style={{ cursor: 'pointer' }}
                  />
                  <button
                    type="button"
                    className="close-btn"
                    onClick={removeImage}
                    title="Remove image"
                  >
                    <MdClose />
                  </button>
                </div>
              </div>
            )}

            <div className="quick-post-footer">
              <div className="character-count-small">
                {postContent.length}/280
                {selectedPlatforms.includes("Twitter") && postContent.length > 280 && (
                  <span style={{ color: '#ef4444', marginLeft: '5px' }}>
                    (Twitter: {280 - postContent.length})
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="post-now-btn"
                disabled={
                  (!postContent.trim() && !imageUrl.trim() && !imageFile) ||
                  selectedPlatforms.length === 0 ||
                  isPosting ||
                  connectedPlatforms.length === 0
                }
              >
                <MdSend />
                {isPosting ? 'Posting...' : 'Post Now'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Modal */}
      {showImageModal && imagePreview && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={imagePreview} alt="Full size preview" />
            <button
              className="image-modal-close"
              onClick={closeImageModal}
              title="Close preview"
            >
              <MdClose />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isPosting && (
        <div className="spinner-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Publishing your post...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default PostNow;