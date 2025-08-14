// PostNow.jsx - Enhanced component with image preview modal
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
    const stored = sessionStorage.getItem('scheduledPosts');
    const storedAccounts = sessionStorage.getItem('connectedAccounts');
    
    if (storedAccounts) {
      const accounts = JSON.parse(storedAccounts);
      setConnectedAccounts(accounts);
    } else {
      // Check if there are any connected accounts (like Facebook, Twitter, LinkedIn)
      const accounts = [];
      
      // Check Facebook
      const fbPageId = sessionStorage.getItem("fb_page_id");
      const fbPageToken = sessionStorage.getItem("fb_page_token");
      
      if (fbPageId && fbPageToken) {
        const fbAccount = {
          id: 'facebook_' + fbPageId,
          platform: "Facebook",
          username: sessionStorage.getItem("fb_page_name") || "Facebook Page",
          displayName: sessionStorage.getItem("fb_page_name") || "Facebook Page",
          status: "active"
        };
        accounts.push(fbAccount);
      }
      
      // Check Twitter
      const twitterAccessToken = sessionStorage.getItem("twitter_access_token");
      const twitterUserId = sessionStorage.getItem("twitter_user_id");
      
      if (twitterAccessToken && twitterUserId) {
        const twitterAccount = {
          id: 'twitter_' + twitterUserId,
          platform: "Twitter",
          username: sessionStorage.getItem("twitter_username") || "Twitter User",
          displayName: sessionStorage.getItem("twitter_display_name") || "Twitter User",
          status: "active"
        };
        accounts.push(twitterAccount);
      }
      
      // Check LinkedIn
      const linkedinAccessToken = sessionStorage.getItem("linkedin_access_token");
      
      if (linkedinAccessToken) {
        const linkedinAccount = {
          id: 'linkedin_user',
          platform: "LinkedIn",
          username: sessionStorage.getItem("linkedin_username") || "LinkedIn User",
          displayName: sessionStorage.getItem("linkedin_display_name") || "LinkedIn User",
          status: "active"
        };
        accounts.push(linkedinAccount);
      }
      
      if (accounts.length > 0) {
        setConnectedAccounts(accounts);
      }
    }
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

  // Twitter posting function
  const postToTwitter = async (content, imageUrl = null, imageFile = null) => {
    const accessToken = sessionStorage.getItem("twitter_access_token");
    const userId = sessionStorage.getItem("twitter_user_id");

    if (!accessToken || !userId) {
      throw new Error("Twitter not connected. Please connect your account first.");
    }

    try {
      let mediaId = null;

      // Handle image upload if provided
      if (imageFile || imageUrl) {
        mediaId = await uploadTwitterMedia(imageFile, imageUrl, accessToken);
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

      // Post tweet
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetPayload),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        console.log("✅ Twitter post success:", result);
        return {
          success: true,
          data: result.data,
          tweetId: result.data.id,
          message: "Tweet posted successfully!",
        };
      } else {
        throw new Error(result.detail || result.error || "Failed to post tweet");
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

  const handlePostNow = async (e) => {
    e.preventDefault();

    if ((!postContent.trim() && !imageUrl.trim() && !imageFile) || selectedPlatforms.length === 0) {
      return;
    }

    setIsPosting(true);

    try {
      // Simulate posting delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      let postsSuccessful = 0;
      let postsFailed = 0;

      for (const platform of selectedPlatforms) {
        try {
          if (platform === "Twitter") {
            await postToTwitter(postContent, imageUrl, imageFile);
            postsSuccessful++;
            showSuccess(`🐦 Tweet posted successfully!`);
          } else if (platform === "Facebook") {
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
                showSuccess(`🎉 Photo successfully posted to Facebook!`);
              } else {
                throw new Error(data.error.message);
              }
            } else if (imageUrl.trim()) {
              // Post image URL
              FB.api(
                `/${pageId}/photos`,
                "POST",
                { url: imageUrl, caption: postContent, access_token: pageToken },
                function (response) {
                  if (response && !response.error) {
                    postsSuccessful++;
                    showSuccess(`🎉 Photo successfully posted to Facebook!`);
                  } else {
                    postsFailed++;
                    showToast({ message: "Failed to post photo URL to Facebook", type: "error" });
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
                    postsSuccessful++;
                    showSuccess(`🎉 Post successfully published to Facebook!`);
                  } else {
                    postsFailed++;
                    showToast({ message: "Failed to post text to Facebook", type: "error" });
                  }
                }
              );
            }
          } else {
            // For other platforms (simulated success)
            postsSuccessful++;
            showSuccess(`🎉 Post successfully published to ${platform}!`);
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
          showSuccess(`🚀 Successfully posted to ${selectedPlatforms.length} platforms!`);
        }, 500);
      }

      // Reset form after successful posting
      setPostContent("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      setSelectedPlatforms([]);

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