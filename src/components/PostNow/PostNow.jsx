// Updated PostNow.jsx - Handles simultaneous Twitter and Facebook posting
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
  // TWITTER POSTING FUNCTION
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
  // FACEBOOK POSTING FUNCTION
  // =====================
  const postToFacebook = async (content, imageUrl = null, imageFile = null) => {
    const pageId = sessionStorage.getItem("fb_page_id");
    const pageToken = sessionStorage.getItem("fb_page_token");

    if (!pageId || !pageToken) {
      throw new Error("Facebook not connected. Please connect your account first.");
    }

    try {
      console.log("📘 Posting to Facebook...", { content, imageUrl: !!imageUrl, imageFile: !!imageFile });

      return new Promise((resolve, reject) => {
        if (typeof FB === 'undefined') {
          reject(new Error("Facebook SDK not loaded"));
          return;
        }

        if (imageFile) {
          // Post with file upload
          const formData = new FormData();
          formData.append("source", imageFile);
          formData.append("caption", content);
          formData.append("access_token", pageToken);

          fetch(`https://graph.facebook.com/${pageId}/photos`, {
            method: "POST",
            body: formData,
          })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              reject(new Error(data.error.message));
            } else {
              console.log("✅ Facebook photo posted successfully:", data.id);
              resolve({
                success: true,
                data: data,
                postId: data.id,
                message: "Facebook photo posted successfully!",
              });
            }
          })
          .catch(error => reject(error));

        } else if (imageUrl && imageUrl.trim()) {
          // Post with image URL
          FB.api(
            `/${pageId}/photos`,
            "POST",
            { 
              url: imageUrl, 
              caption: content, 
              access_token: pageToken 
            },
            function (response) {
              if (response && !response.error) {
                console.log("✅ Facebook photo URL posted successfully:", response.id);
                resolve({
                  success: true,
                  data: response,
                  postId: response.id,
                  message: "Facebook photo posted successfully!",
                });
              } else {
                const errorMessage = response?.error?.message || "Failed to post photo URL to Facebook";
                reject(new Error(errorMessage));
              }
            }
          );

        } else {
          // Text-only post
          FB.api(
            `/${pageId}/feed`,
            "POST",
            { 
              message: content, 
              access_token: pageToken 
            },
            function (response) {
              if (response && !response.error) {
                console.log("✅ Facebook text post successful:", response.id);
                resolve({
                  success: true,
                  data: response,
                  postId: response.id,
                  message: "Facebook post published successfully!",
                });
              } else {
                const errorMessage = response?.error?.message || "Failed to post to Facebook";
                reject(new Error(errorMessage));
              }
            }
          );
        }
      });
    } catch (error) {
      console.error("❌ Facebook post error:", error);
      throw error;
    }
  };

  // =====================
  // LINKEDIN POSTING FUNCTION
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
  // MAIN POSTING HANDLER - SIMULTANEOUS POSTING
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
      const postResults = [];

      // Create promises for all selected platforms
      const postPromises = selectedPlatforms.map(async (platform) => {
        try {
          let result;
          
          if (platform === "Twitter") {
            result = await postToTwitter(postContent, imageUrl, imageFile);
          } else if (platform === "Facebook") {
            result = await postToFacebook(postContent, imageUrl, imageFile);
          } else if (platform === "LinkedIn") {
            result = await postToLinkedIn(postContent, imageUrl, imageFile);
          } else {
            throw new Error(`${platform} posting not implemented yet`);
          }

          return { platform, success: true, result };
        } catch (error) {
          console.error(`❌ Error posting to ${platform}:`, error);
          return { platform, success: false, error: error.message };
        }
      });

      // Wait for all posts to complete (simultaneous posting)
      console.log("🚀 Starting simultaneous posting to", selectedPlatforms);
      const results = await Promise.all(postPromises);

      // Process results
      results.forEach(({ platform, success, result, error }) => {
        if (success) {
          postsSuccessful++;
          showSuccess(`✅ ${platform} post successful!`);
          console.log(`✅ ${platform} posted successfully:`, result);
        } else {
          postsFailed++;
          showToast({ 
            message: `❌ ${platform} failed: ${error}`, 
            type: 'error' 
          });
        }
      });

      // Show summary
      if (selectedPlatforms.length > 1) {
        setTimeout(() => {
          if (postsSuccessful === selectedPlatforms.length) {
            showSuccess(`🎉 Successfully posted to all ${postsSuccessful} platforms!`);
          } else if (postsSuccessful > 0) {
            showToast({ 
              message: `✅ Posted to ${postsSuccessful}/${selectedPlatforms.length} platforms`, 
              type: 'warning' 
            });
          } else {
            showToast({ 
              message: `❌ Failed to post to all platforms`, 
              type: 'error' 
            });
          }
        }, 1000);
      }

      // Reset form if at least one post was successful
      if (postsSuccessful > 0) {
        setPostContent("");
        setImageUrl("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedPlatforms([]);
      }

    } catch (error) {
      console.error('❌ Unexpected posting error:', error);
      showToast({ message: 'An unexpected error occurred while posting.', type: 'error' });
    } finally {
      setIsPosting(false);
    }
  };

  // Character count for different platforms
  const getCharacterLimit = () => {
    if (selectedPlatforms.includes("Twitter")) {
      return 280; // Twitter limit
    }
    return 1000; // General limit for other platforms
  };

  const characterLimit = getCharacterLimit();
  const isOverLimit = postContent.length > characterLimit;

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
          {/* Platform Selection */}
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

          {/* Post Content Area */}
          <div className="quick-post-content">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share it with the world right now..."
              className="quick-post-textarea"
              rows="4"
              maxLength={characterLimit + 50} // Allow slight overage for validation
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
                <span className={isOverLimit ? 'error' : ''}>
                  {postContent.length}/{characterLimit}
                </span>
                {selectedPlatforms.includes("Twitter") && (
                  <span className="tweet-counter">
                    {isOverLimit ? ' (Too long for Twitter)' : ' (Twitter ready)'}
                  </span>
                )}
                {selectedPlatforms.length > 1 && (
                  <span style={{ marginLeft: '10px', color: 'var(--accent-color)' }}>
                    📤 Posting to {selectedPlatforms.length} platforms
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
                  connectedPlatforms.length === 0 ||
                  isOverLimit
                }
              >
                <MdSend />
                {isPosting ? 
                  `Posting to ${selectedPlatforms.length} platforms...` : 
                  selectedPlatforms.length > 1 ? 
                    `Post to ${selectedPlatforms.length} platforms` : 
                    'Post Now'
                }
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
            <p>Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}...</p>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px' }}>
              {selectedPlatforms.join(', ')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostNow;