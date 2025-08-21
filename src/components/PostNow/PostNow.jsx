// Updated PostNow.jsx - Works with Backend API
import React, { useState } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdClose } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { useToast } from "../Toast/ToastProvider";

const BACKEND_URL = "http://localhost:3001";

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
  // Add this debugging function at the top of your component
  const debugCredentials = () => {
    console.log("🔍 Debugging stored credentials:");

    // Twitter credentials
    const twitterToken = sessionStorage.getItem("twitter_access_token");
    const twitterUserId = sessionStorage.getItem("twitter_user_id");
    console.log("Twitter:", {
      hasToken: !!twitterToken,
      hasUserId: !!twitterUserId,
      token: twitterToken ? twitterToken.substring(0, 20) + "..." : null,
    });

    // Facebook credentials
    const fbPageId = sessionStorage.getItem("fb_page_id");
    const fbPageToken = sessionStorage.getItem("fb_page_token");
    console.log("Facebook:", {
      hasPageId: !!fbPageId,
      hasPageToken: !!fbPageToken,
      pageId: fbPageId,
      token: fbPageToken ? fbPageToken.substring(0, 20) + "..." : null,
    });

    // LinkedIn credentials
    const linkedinToken = sessionStorage.getItem("linkedin_access_token");
    const linkedinUserId = sessionStorage.getItem("linkedin_user_id");
    console.log("LinkedIn:", {
      hasToken: !!linkedinToken,
      hasUserId: !!linkedinUserId,
      userId: linkedinUserId,
      token: linkedinToken ? linkedinToken.substring(0, 20) + "..." : null,
    });
  };

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
          id: "facebook_" + fbPageId,
          platform: "Facebook",
          username: fbPageName || "Facebook Page",
          displayName: fbPageName || "Facebook Page",
          status: "active",
        });
      }

      // Check Twitter
      const twitterToken = sessionStorage.getItem("twitter_access_token");
      const twitterUserId = sessionStorage.getItem("twitter_user_id");
      const twitterUsername = sessionStorage.getItem("twitter_username");
      const twitterDisplayName = sessionStorage.getItem("twitter_display_name");

      if (twitterToken && twitterUserId) {
        accounts.push({
          id: "twitter_" + twitterUserId,
          platform: "Twitter",
          username: twitterUsername || "@twitter_user",
          displayName: twitterDisplayName || "Twitter User",
          status: "active",
        });
      }

      // Check LinkedIn
      const linkedinToken = sessionStorage.getItem("linkedin_access_token");
      const linkedinUserId = sessionStorage.getItem("linkedin_user_id");
      const linkedinUsername = sessionStorage.getItem("linkedin_username");
      const linkedinDisplayName = sessionStorage.getItem(
        "linkedin_display_name"
      );

      if (linkedinToken && linkedinUserId) {
        accounts.push({
          id: "linkedin_" + linkedinUserId,
          platform: "LinkedIn",
          username: linkedinUsername || "LinkedIn User",
          displayName: linkedinDisplayName || "LinkedIn User",
          status: "active",
        });
      }

      setConnectedAccounts(accounts);
      console.log("📱 Connected accounts loaded:", accounts);
    };

    loadConnectedAccounts();
  }, []);

  // Get only connected platforms
  const getConnectedPlatforms = () => {
    return allPlatforms.filter((platform) =>
      connectedAccounts.some((account) => account.platform === platform.name)
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
    const fileInput = document.querySelector(".image-file-input");
    if (fileInput) fileInput.value = "";
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
  // BACKEND API POSTING FUNCTIONS
  // =====================

  const postToPlatformViaBackend = async (
    platform,
    content,
    imageFile,
    imageUrl
  ) => {
    console.log(`🚀 Posting to ${platform}:`, {
      hasContent: !!content,
      hasImageFile: !!imageFile,
      hasImageUrl: !!imageUrl,
    });

    const formData = new FormData();
    formData.append("content", content || "");

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    // Add platform-specific credentials with validation
    if (platform === "Twitter") {
      const accessToken = sessionStorage.getItem("twitter_access_token");
      if (!accessToken) {
        throw new Error(
          "Twitter access token not found. Please reconnect your Twitter account."
        );
      }
      formData.append("accessToken", accessToken);
      console.log("✅ Twitter credentials added");
    } else if (platform === "Facebook") {
      const pageId = sessionStorage.getItem("fb_page_id");
      const pageToken = sessionStorage.getItem("fb_page_token");
      if (!pageId || !pageToken) {
        throw new Error(
          "Facebook page credentials not found. Please reconnect your Facebook account."
        );
      }
      formData.append("pageId", pageId);
      formData.append("pageToken", pageToken);
      console.log("✅ Facebook credentials added");
    } else if (platform === "LinkedIn") {
      const accessToken = sessionStorage.getItem("linkedin_access_token");
      const userId = sessionStorage.getItem("linkedin_user_id");
      if (!accessToken || !userId) {
        throw new Error(
          "LinkedIn credentials not found. Please reconnect your LinkedIn account."
        );
      }
      formData.append("accessToken", accessToken);
      formData.append("userId", userId);
      console.log("✅ LinkedIn credentials added");
    }

    const response = await fetch(
      `${BACKEND_URL}/api/posting/${platform.toLowerCase()}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    console.log(`📨 ${platform} response:`, result);

    if (!response.ok) {
      throw new Error(result.error || `Failed to post to ${platform}`);
    }

    return result;
  };

  // FIXED: Multi-platform posting with better error handling
  const postToMultiplePlatformsViaBackend = async (
    platforms,
    content,
    imageFile,
    imageUrl
  ) => {
    // Debug credentials before posting
    debugCredentials();

    const formData = new FormData();
    formData.append("content", content || "");
    formData.append("platforms", JSON.stringify(platforms));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    // Gather credentials for all platforms with validation
    const credentials = {};
    const missingCredentials = [];

    if (platforms.includes("Twitter")) {
      const twitterToken = sessionStorage.getItem("twitter_access_token");
      if (twitterToken) {
        credentials.twitter = { accessToken: twitterToken };
      } else {
        missingCredentials.push("Twitter");
      }
    }

    if (platforms.includes("Facebook")) {
      const fbPageId = sessionStorage.getItem("fb_page_id");
      const fbPageToken = sessionStorage.getItem("fb_page_token");
      if (fbPageId && fbPageToken) {
        credentials.facebook = { pageId: fbPageId, pageToken: fbPageToken };
      } else {
        missingCredentials.push("Facebook");
      }
    }

    if (platforms.includes("LinkedIn")) {
      const linkedinToken = sessionStorage.getItem("linkedin_access_token");
      const linkedinUserId = sessionStorage.getItem("linkedin_user_id");
      if (linkedinToken && linkedinUserId) {
        credentials.linkedin = {
          accessToken: linkedinToken,
          userId: linkedinUserId,
        };
      } else {
        missingCredentials.push("LinkedIn");
      }
    }

    // Check for missing credentials
    if (missingCredentials.length > 0) {
      throw new Error(
        `Missing credentials for: ${missingCredentials.join(
          ", "
        )}. Please reconnect these accounts.`
      );
    }

    console.log("📤 Sending multi-platform request:", {
      platforms,
      credentialsAvailable: Object.keys(credentials),
      hasImage: !!(imageFile || imageUrl),
      contentLength: content?.length || 0,
    });

    formData.append("credentials", JSON.stringify(credentials));

    const response = await fetch(`${BACKEND_URL}/api/posting/multi`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("📨 Backend response:", result);

    if (!response.ok) {
      throw new Error(result.error || "Failed to post to multiple platforms");
    }

    return result;
  };

  // =====================
  // MAIN POSTING HANDLER
  // =====================
// IMPROVED: Main posting handler with better error reporting
  const handlePostNow = async (e) => {
    e.preventDefault();

    if (
      (!postContent.trim() && !imageUrl.trim() && !imageFile) ||
      selectedPlatforms.length === 0
    ) {
      showToast({
        message:
          "Please enter content or add an image, and select at least one platform",
        type: "warning",
      });
      return;
    }

    setIsPosting(true);
    let shouldResetForm = false; // Track if we should reset the form

    try {
      console.log("🚀 Starting posting process...", {
        platforms: selectedPlatforms,
        hasContent: !!postContent.trim(),
        hasImage: !!(imageFile || imageUrl),
        multiPlatform: selectedPlatforms.length > 1,
      });

      if (selectedPlatforms.length === 1) {
        // Single platform posting
        const platform = selectedPlatforms[0];
        console.log(`📤 Single platform posting to ${platform}`);

        const result = await postToPlatformViaBackend(
          platform,
          postContent,
          imageFile,
          imageUrl
        );

        console.log(`✅ ${platform} posted successfully:`, result);
        showSuccess(`✅ ${platform} post successful!`);
        showToast({
          message: `Successfully posted to ${platform}!`,
          type: "success",
        });

        // Single platform succeeded, reset form
        shouldResetForm = true;

      } else {
        // Multi-platform posting
        console.log(`📤 Multi-platform posting to:`, selectedPlatforms);

        const result = await postToMultiplePlatformsViaBackend(
          selectedPlatforms,
          postContent,
          imageFile,
          imageUrl
        );

        console.log("📊 Multi-platform posting results:", result);

        // Process results
        const successfulPosts = [];
        const failedPosts = [];

        result.results.forEach(
          ({ platform, success, result: platformResult, error }) => {
            if (success) {
              successfulPosts.push(platform);
              console.log(`✅ ${platform} success:`, platformResult);
            } else {
              failedPosts.push({ platform, error });
              console.error(`❌ ${platform} failed:`, error);
            }
          }
        );

        // Show individual results
        successfulPosts.forEach((platform) => {
          showToast({
            message: `✅ ${platform} posted successfully!`,
            type: "success",
          });
        });

        failedPosts.forEach(({ platform, error }) => {
          showToast({
            message: `❌ ${platform} failed: ${error}`,
            type: "error",
          });
        });

        // Show summary after individual notifications
        setTimeout(() => {
          if (successfulPosts.length === selectedPlatforms.length) {
            showSuccess(
              `🎉 Successfully posted to all ${selectedPlatforms.length} platforms!`
            );
          } else if (successfulPosts.length > 0) {
            showSuccess(
              `✅ Posted to ${successfulPosts.length}/${selectedPlatforms.length} platforms`
            );
          } else {
            showToast({
              message: `❌ Failed to post to all platforms`,
              type: "error",
            });
          }
        }, 2000);

        // Reset form if at least one platform succeeded
        shouldResetForm = successfulPosts.length > 0;
      }

      // Reset form if posting was successful
      if (shouldResetForm) {
        setPostContent("");
        setImageUrl("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedPlatforms([]);

        // Reset file input
        const fileInput = document.querySelector(".image-file-input");
        if (fileInput) fileInput.value = "";
      }

    } catch (error) {
      console.error("❌ Posting error:", error);

      // More specific error messages
      if (error.message.includes("credentials")) {
        showToast({
          message: `Authentication issue: ${error.message}`,
          type: "error",
        });
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        showToast({
          message: `Network error: Please check your connection and try again`,
          type: "error",
        });
      } else {
        showToast({
          message: `Failed to post: ${error.message}`,
          type: "error",
        });
      }
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
                  <p>
                    Connect your social media accounts to start posting
                    instantly
                  </p>
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
                    style={{ cursor: "pointer" }}
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
                <span className={isOverLimit ? "error" : ""}>
                  {postContent.length}/{characterLimit}
                </span>
                {selectedPlatforms.includes("Twitter") && (
                  <span className="tweet-counter">
                    {isOverLimit
                      ? " (Too long for Twitter)"
                      : " (Twitter ready)"}
                  </span>
                )}
                {selectedPlatforms.length > 1 && (
                  <span
                    style={{ marginLeft: "10px", color: "var(--accent-color)" }}
                  >
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
                {isPosting
                  ? `Posting to ${selectedPlatforms.length} platforms...`
                  : selectedPlatforms.length > 1
                  ? `Post to ${selectedPlatforms.length} platforms`
                  : "Post Now"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Modal */}
      {showImageModal && imagePreview && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
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
            <p>
              Publishing to {selectedPlatforms.length} platform
              {selectedPlatforms.length > 1 ? "s" : ""}...
            </p>
            <div
              style={{
                fontSize: "14px",
                color: "var(--text-muted)",
                marginTop: "10px",
              }}
            >
              {selectedPlatforms.join(", ")}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "5px",
              }}
            >
              Via secure backend API
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

export default PostNow;
