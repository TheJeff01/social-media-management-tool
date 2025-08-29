// Updated PostNow.jsx - Multiple Images Support
import React, { useState } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdClose, MdAdd } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { useToast } from "../Toast/ToastProvider";

const BACKEND_URL = "http://localhost:3001";

function PostNow() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // Updated image state to handle multiple images
  const [images, setImages] = useState([]); // Array of image objects
  const [imageUrls, setImageUrls] = useState(""); // Comma-separated URLs
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const { showToast } = useToast();

  // All available platforms with their details
  const allPlatforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2", maxImages: 4 },
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2", maxImages: 10 },
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F", maxImages: 10 },
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5", maxImages: 9 },
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

      // Check Instagram (Graph API requires page token + IG account id)
      const instagramAccountId = sessionStorage.getItem("instagram_user_id");
      const instagramPageAccessToken = sessionStorage.getItem("instagram_page_access_token");
      const instagramUsername = sessionStorage.getItem("instagram_username");
      const instagramDisplayName = sessionStorage.getItem("instagram_display_name");
      if (instagramAccountId && instagramPageAccessToken) {
        accounts.push({
          id: "instagram_" + instagramAccountId,
          platform: "Instagram",
          username: instagramUsername || "@instagram_user",
          displayName: instagramDisplayName || "Instagram User",
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

  // Get the maximum image limit based on selected platforms
  const getImageLimit = () => {
    if (selectedPlatforms.length === 0) return 10; // Default limit
    
    const limits = selectedPlatforms.map(platformName => {
      const platform = allPlatforms.find(p => p.name === platformName);
      return platform ? platform.maxImages : 1;
    });
    
    return Math.min(...limits); // Use the most restrictive limit
  };

  // Updated file upload handler for multiple files
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageLimit = getImageLimit();
    
    if (files.length + images.length > imageLimit) {
      showToast({
        message: `Maximum ${imageLimit} images allowed for selected platforms`,
        type: "warning",
      });
      return;
    }

    const newImages = [];
    let processedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageObj = {
          id: Date.now() + index,
          file: file,
          preview: event.target.result,
          name: file.name,
          size: file.size,
          type: 'file'
        };
        newImages.push(imageObj);
        processedCount++;
        
        if (processedCount === files.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear image URLs if files are selected
    if (files.length > 0) {
      setImageUrls("");
    }
  };

  // Updated URL handler for multiple URLs
  const handleImageUrlsChange = (e) => {
    const urls = e.target.value;
    setImageUrls(urls);

    if (urls.trim()) {
      // Parse comma-separated URLs
      const urlArray = urls.split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      const imageLimit = getImageLimit();
      
      if (urlArray.length > imageLimit) {
        showToast({
          message: `Maximum ${imageLimit} images allowed for selected platforms`,
          type: "warning",
        });
        return;
      }

      const urlImages = urlArray.map((url, index) => ({
        id: Date.now() + index,
        url: url,
        preview: url,
        name: `URL Image ${index + 1}`,
        type: 'url'
      }));

      setImages(urlImages);
    } else {
      // Clear images if URLs are empty
      setImages(prev => prev.filter(img => img.type === 'file'));
    }
  };

  // Remove specific image
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    // If it was a URL image, update the URLs string
    const remainingUrlImages = images
      .filter(img => img.type === 'url' && img.id !== imageId)
      .map(img => img.url);
    
    if (remainingUrlImages.length !== images.filter(img => img.type === 'url').length) {
      setImageUrls(remainingUrlImages.join(', '));
    }
  };

  // Clear all images
  const clearAllImages = () => {
    setImages([]);
    setImageUrls("");
    
    // Reset file input
    const fileInput = document.querySelector(".image-file-input");
    if (fileInput) fileInput.value = "";
  };

  const openImageModal = (index = 0) => {
    setModalImageIndex(index);
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

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const postToPlatformViaBackend = async (platform, content, images, imageUrls) => {
    console.log(`🚀 Posting to ${platform}:`, {
      hasContent: !!content,
      imageCount: images.length,
      hasImageUrls: !!imageUrls,
    });

    const formData = new FormData();
    formData.append("content", content || "");

    // Add multiple image files
    images.forEach((image, index) => {
      if (image.type === 'file' && image.file) {
        formData.append(`images`, image.file);
      }
    });

    // Add image URLs (deduplicated to avoid double posting)
    const urlList = Array.from(new Set([
      ...images.filter(img => img.type === 'url').map(img => img.url),
      ...(imageUrls ? imageUrls.split(',').map(url => url.trim()).filter(Boolean) : [])
    ].filter(Boolean)));
    
    if (urlList.length > 0) {
      formData.append("imageUrls", urlList.join(','));
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
    } else if (platform === "Instagram") {
      const pageAccessToken = sessionStorage.getItem("instagram_page_access_token");
      const instagramAccountId = sessionStorage.getItem("instagram_user_id");
      if (!pageAccessToken || !instagramAccountId) {
        throw new Error(
          "Instagram credentials not found. Please reconnect your Instagram account."
        );
      }
      formData.append("pageAccessToken", pageAccessToken);
      formData.append("instagramAccountId", instagramAccountId);
      console.log("✅ Instagram credentials added");
    }

    // Retry with backoff for HTTP 429
    const maxRetries = 3;
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
      const response = await fetch(
        `${BACKEND_URL}/api/posting/${platform.toLowerCase()}`,
        {
          method: "POST",
          body: formData,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (_) {
        result = {};
      }

      console.log(`📨 ${platform} response (attempt ${attempt + 1}):`, result);

      if (response.ok) {
        return result;
      }

      // Handle 429 with optional Retry-After
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfterHeader = response.headers.get("Retry-After");
        let delayMs = 0;
        if (retryAfterHeader) {
          const parsed = Number(retryAfterHeader);
          delayMs = Number.isFinite(parsed) ? parsed * 1000 : 0;
        }
        // Exponential backoff with jitter, base 1s up to 8s
        const backoff = Math.min(8000, 1000 * Math.pow(2, attempt));
        const jitter = Math.floor(Math.random() * 300);
        const waitMs = Math.max(backoff + jitter, delayMs || 0);
        console.warn(`⏳ Rate limited posting to ${platform}. Retrying in ${waitMs}ms...`);
        await sleep(waitMs);
        attempt += 1;
        continue;
      }

      lastError = new Error(result?.error || `Failed to post to ${platform}`);
      break;
    }

    throw lastError || new Error(`Failed to post to ${platform}`);
  };

  // UPDATED: Multi-platform posting with multiple images
  const postToMultiplePlatformsViaBackend = async (
    platforms,
    content,
    images,
    imageUrls
  ) => {
    // Debug credentials before posting
    debugCredentials();

    const formData = new FormData();
    formData.append("content", content || "");
    formData.append("platforms", JSON.stringify(platforms));

    // Add multiple image files
    images.forEach((image, index) => {
      if (image.type === 'file' && image.file) {
        formData.append(`images`, image.file);
      }
    });

    // Add image URLs (deduplicated to avoid double posting)
    const urlList = Array.from(new Set([
      ...images.filter(img => img.type === 'url').map(img => img.url),
      ...(imageUrls ? imageUrls.split(',').map(url => url.trim()).filter(Boolean) : [])
    ].filter(Boolean)));
    
    if (urlList.length > 0) {
      formData.append("imageUrls", urlList.join(','));
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

    if (platforms.includes("Instagram")) {
      const pageAccessToken = sessionStorage.getItem("instagram_page_access_token");
      const instagramAccountId = sessionStorage.getItem("instagram_user_id");
      if (pageAccessToken && instagramAccountId) {
        credentials.instagram = {
          pageAccessToken,
          instagramAccountId,
        };
      } else {
        missingCredentials.push("Instagram");
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
      totalImages: images.length,
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
  const handlePostNow = async (e) => {
    e.preventDefault();

    const hasContent = postContent.trim();
    const hasImages = images.length > 0 || imageUrls.trim();
    const hasPlatforms = selectedPlatforms.length > 0;

    if (!hasContent && !hasImages) {
      showToast({
        message: "Please enter content or add images",
        type: "warning",
      });
      return;
    }

    if (!hasPlatforms) {
      showToast({
        message: "Please select at least one platform",
        type: "warning",
      });
      return;
    }

    // Check image limits for selected platforms
    const imageLimit = getImageLimit();
    if (images.length > imageLimit) {
      showToast({
        message: `Too many images for selected platforms (max: ${imageLimit})`,
        type: "warning",
      });
      return;
    }

    setIsPosting(true);
    let shouldResetForm = false;

    try {
      console.log("🚀 Starting posting process...", {
        platforms: selectedPlatforms,
        hasContent: !!hasContent,
        imageCount: images.length,
        multiPlatform: selectedPlatforms.length > 1,
      });

      if (selectedPlatforms.length === 1) {
        // Single platform posting
        const platform = selectedPlatforms[0];
        console.log(`📤 Single platform posting to ${platform}`);

        const result = await postToPlatformViaBackend(
          platform,
          postContent,
          images,
          imageUrls
        );

        console.log(`✅ ${platform} posted successfully:`, result);
        showSuccess(`✅ ${platform} post successful!`);
        showToast({
          message: `Successfully posted to ${platform}!`,
          type: "success",
        });

        shouldResetForm = true;
      } else {
        // Multi-platform posting
        console.log(`📤 Multi-platform posting to:`, selectedPlatforms);

        const result = await postToMultiplePlatformsViaBackend(
          selectedPlatforms,
          postContent,
          images,
          imageUrls
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

        shouldResetForm = successfulPosts.length > 0;
      }

      // Reset form if posting was successful
      if (shouldResetForm) {
        setPostContent("");
        clearAllImages();
        setSelectedPlatforms([]);
      }
    } catch (error) {
      console.error("❌ Posting error:", error);

      // More specific error messages
      if (error.message.includes("429") || /rate limit/i.test(error.message)) {
        showToast({
          message: `Rate limited: ${error.message}. We retried automatically. Please wait and try again if needed.`,
          type: "warning",
        });
      } else if (error.message.includes("credentials")) {
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
  const imageLimit = getImageLimit();

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
                  title={`Post to ${platform.name} (max ${platform.maxImages} images)`}
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

          {/* Image limit indicator */}
          {selectedPlatforms.length > 0 && (
            <div className="image-limit-info">
              <small style={{color: "var(--text-muted)"}}>
                📸 Max {imageLimit} images for selected platforms • {images.length} selected
              </small>
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
              maxLength={characterLimit + 50}
            />

            {/* Multiple Images Upload Section */}
            <div className="images-upload-section">
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="image-file-input"
                  id="imagesUpload"
                />

                <input
                  type="text"
                  value={imageUrls}
                  onChange={handleImageUrlsChange}
                  placeholder="Or paste image URLs here (comma-separated)..."
                  className="image-url-input"
                />

                <div className="upload-buttons">
                  <label htmlFor="imagesUpload" className="image-upload-label">
                    <MdOutlineImage />
                    Add Images
                    <span className="upload-hint">({imageLimit - images.length} remaining)</span>
                  </label>
                  
                  {images.length > 0 && (
                    <button
                      type="button"
                      className="clear-images-btn"
                      onClick={clearAllImages}
                      title="Clear all images"
                    >
                      <MdClose />
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Multiple Images Preview Grid */}
              {images.length > 0 && (
                <div className="images-preview-grid">
                  {images.map((image, index) => (
                    <div key={image.id} className="image-preview-item">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        onClick={() => openImageModal(index)}
                        style={{ cursor: "pointer" }}
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(image.id)}
                        title="Remove image"
                      >
                        <MdClose />
                      </button>
                      <div className="image-info">
                        <small>{image.name}</small>
                        {image.type === 'file' && image.size && (
                          <small>{(image.size / 1024 / 1024).toFixed(1)}MB</small>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add more images button */}
                  {images.length < imageLimit && (
                    <label htmlFor="imagesUpload" className="add-more-images">
                      <MdAdd />
                      <span>Add More</span>
                    </label>
                  )}
                </div>
              )}
            </div>

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
                {images.length > 0 && (
                  <span
                    style={{ marginLeft: "10px", color: "var(--success-color)" }}
                  >
                    📸 {images.length} image{images.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="post-now-btn"
                disabled={
                  ((!postContent.trim() && images.length === 0) ||
                  selectedPlatforms.length === 0 ||
                  isPosting ||
                  connectedPlatforms.length === 0 ||
                  isOverLimit ||
                  images.length > imageLimit)
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

      {/* Image Modal with navigation */}
      {showImageModal && images.length > 0 && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={images[modalImageIndex]?.preview} alt="Full size preview" />
            
            {images.length > 1 && (
              <div className="modal-navigation">
                <button
                  className="nav-btn prev"
                  onClick={() => setModalImageIndex(prev => 
                    prev === 0 ? images.length - 1 : prev - 1
                  )}
                  title="Previous image"
                >
                  ‹
                </button>
                <span className="image-counter">
                  {modalImageIndex + 1} of {images.length}
                </span>
                <button
                  className="nav-btn next"
                  onClick={() => setModalImageIndex(prev => 
                    prev === images.length - 1 ? 0 : prev + 1
                  )}
                  title="Next image"
                >
                  ›
                </button>
              </div>
            )}
            
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
            {images.length > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "5px",
                }}
              >
                📸 Uploading {images.length} image{images.length > 1 ? 's' : ''}
              </div>
            )}
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