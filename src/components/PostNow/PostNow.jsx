// Updated PostNow.jsx - Multiple Images and Videos Support
import React, { useState, useEffect } from "react";
import "./PostNow.css";
import { MdSend, MdOutlineImage, MdClose, MdAdd, MdVideoLibrary } from "react-icons/md";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { useToast } from "../Toast/ToastProvider";

const BACKEND_URL = "http://localhost:3001";

function PostNow() {
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // Updated media state to handle both images and videos
  const [media, setMedia] = useState([]); // Array of media objects (images and videos)
  const [mediaUrls, setMediaUrls] = useState(""); // Comma-separated URLs
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [modalMediaIndex, setModalMediaIndex] = useState(0);
  
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const { showToast } = useToast();

  // All available platforms with their details
  const allPlatforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2", maxMedia: 4, supportsVideo: true, videoFormats: ['mp4', 'mov'], maxVideoSize: 512 * 1024 * 1024 }, // 512MB
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2", maxMedia: 10, supportsVideo: true, videoFormats: ['mp4', 'mov', 'avi'], maxVideoSize: 4 * 1024 * 1024 * 1024 }, // 4GB
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F", maxMedia: 10, supportsVideo: true, videoFormats: ['mp4', 'mov'], maxVideoSize: 100 * 1024 * 1024 }, // 100MB
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5", maxMedia: 9, supportsVideo: true, videoFormats: ['mp4', 'mov', 'wmv', 'flv', 'avi'], maxVideoSize: 5 * 1024 * 1024 * 1024 }, // 5GB
  ];

  // Load connected accounts from database on component mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setIsLoadingAccounts(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/posting/accounts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const accounts = data.accounts.map(account => {
          // Map platform names correctly
          let platformName;
          switch (account.platform) {
            case 'twitter':
              platformName = 'Twitter';
              break;
            case 'facebook':
              platformName = 'Facebook';
              break;
            case 'instagram':
              platformName = 'Instagram';
              break;
            case 'linkedin':
              platformName = 'LinkedIn';
              break;
            default:
              platformName = account.platform.charAt(0).toUpperCase() + account.platform.slice(1);
          }
          
          return {
            id: account.id,
            platform: platformName,
            username: account.platform === 'twitter' ? `@${account.accountName}` : account.accountName,
            displayName: account.accountName,
            status: "active",
            accountId: account.accountId,
            hasAccessToken: account.hasAccessToken
          };
        });
        
        setConnectedAccounts(accounts);
        console.log("📱 Connected accounts loaded:", accounts);
      } else {
        console.error('Failed to load connected accounts');
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

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

  // Get the maximum media limit based on selected platforms
  const getMediaLimit = () => {
    if (selectedPlatforms.length === 0) return 10; // Default limit
    
    const limits = selectedPlatforms.map(platformName => {
      const platform = allPlatforms.find(p => p.name === platformName);
      return platform ? platform.maxMedia : 1;
    });
    
    return Math.min(...limits); // Use the most restrictive limit
  };

  // Check if video is supported by selected platforms
  const isVideoSupported = () => {
    if (selectedPlatforms.length === 0) return true;
    
    return selectedPlatforms.every(platformName => {
      const platform = allPlatforms.find(p => p.name === platformName);
      return platform ? platform.supportsVideo : false;
    });
  };

  // Get allowed video formats
  const getAllowedVideoFormats = () => {
    if (selectedPlatforms.length === 0) return ['mp4', 'mov', 'avi', 'wmv', 'flv'];
    
    const formatSets = selectedPlatforms.map(platformName => {
      const platform = allPlatforms.find(p => p.name === platformName);
      return platform ? platform.videoFormats : [];
    });
    
    // Get intersection of all format sets
    return formatSets.reduce((common, formats) => 
      common.filter(format => formats.includes(format))
    );
  };

  // Get maximum video size
  const getMaxVideoSize = () => {
    if (selectedPlatforms.length === 0) return 512 * 1024 * 1024; // Default 512MB
    
    const limits = selectedPlatforms.map(platformName => {
      const platform = allPlatforms.find(p => p.name === platformName);
      return platform ? platform.maxVideoSize : 512 * 1024 * 1024;
    });
    
    return Math.min(...limits); // Use the most restrictive limit
  };

  // Helper function to check file type
  const isVideoFile = (file) => {
    return file.type.startsWith('video/');
  };

  const isImageFile = (file) => {
    return file.type.startsWith('image/');
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Updated file upload handler for both images and videos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const mediaLimit = getMediaLimit();
    const maxVideoSize = getMaxVideoSize();
    const allowedVideoFormats = getAllowedVideoFormats();
    
    if (files.length + media.length > mediaLimit) {
      showToast({
        message: `Maximum ${mediaLimit} files allowed for selected platforms`,
        type: "warning",
      });
      return;
    }

    const newMedia = [];
    let processedCount = 0;
    const validationErrors = [];

    files.forEach((file, index) => {
      // Check file type
      if (!isImageFile(file) && !isVideoFile(file)) {
        validationErrors.push(`${file.name}: Only image and video files are allowed`);
        processedCount++;
        return;
      }

      // Check video support
      if (isVideoFile(file) && !isVideoSupported()) {
        validationErrors.push(`${file.name}: Video not supported by selected platforms`);
        processedCount++;
        return;
      }

      // Check video format
      if (isVideoFile(file)) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedVideoFormats.includes(fileExtension)) {
          validationErrors.push(`${file.name}: Format not supported. Allowed: ${allowedVideoFormats.join(', ')}`);
          processedCount++;
          return;
        }

        // Check video size
        if (file.size > maxVideoSize) {
          validationErrors.push(`${file.name}: Too large. Max size: ${formatFileSize(maxVideoSize)}`);
          processedCount++;
          return;
        }
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const mediaObj = {
          id: Date.now() + index,
          file: file,
          preview: event.target.result,
          name: file.name,
          size: file.size,
          type: 'file',
          mediaType: isVideoFile(file) ? 'video' : 'image',
          format: file.name.split('.').pop().toLowerCase()
        };
        newMedia.push(mediaObj);
        processedCount++;
        
        if (processedCount === files.length) {
          if (validationErrors.length > 0) {
            validationErrors.forEach(error => {
              showToast({
                message: error,
                type: "warning",
              });
            });
          }
          
          if (newMedia.length > 0) {
            setMedia(prev => [...prev, ...newMedia]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear media URLs if files are selected
    if (files.length > 0) {
      setMediaUrls("");
    }
  };

  // Updated URL handler for both images and videos
  const handleMediaUrlsChange = (e) => {
    const urls = e.target.value;
    setMediaUrls(urls);

    if (urls.trim()) {
      // Parse comma-separated URLs
      const urlArray = urls.split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      const mediaLimit = getMediaLimit();
      
      if (urlArray.length > mediaLimit) {
        showToast({
          message: `Maximum ${mediaLimit} files allowed for selected platforms`,
          type: "warning",
        });
        return;
      }

      const urlMedia = urlArray.map((url, index) => {
        // Try to detect if URL is video based on extension or common patterns
        const isVideo = /\.(mp4|mov|avi|wmv|flv|webm|m4v)(\?|$)/i.test(url) || 
                       url.includes('youtube.com') || 
                       url.includes('vimeo.com') ||
                       url.includes('video');
        
        return {
          id: Date.now() + index,
          url: url,
          preview: url,
          name: `URL ${isVideo ? 'Video' : 'Image'} ${index + 1}`,
          type: 'url',
          mediaType: isVideo ? 'video' : 'image'
        };
      });

      setMedia(urlMedia);
    } else {
      // Clear media if URLs are empty
      setMedia(prev => prev.filter(item => item.type === 'file'));
    }
  };

  // Remove specific media item
  const removeMedia = (mediaId) => {
    setMedia(prev => prev.filter(item => item.id !== mediaId));
    
    // If it was a URL media, update the URLs string
    const remainingUrlMedia = media
      .filter(item => item.type === 'url' && item.id !== mediaId)
      .map(item => item.url);
    
    if (remainingUrlMedia.length !== media.filter(item => item.type === 'url').length) {
      setMediaUrls(remainingUrlMedia.join(', '));
    }
  };

  // Clear all media
  const clearAllMedia = () => {
    setMedia([]);
    setMediaUrls("");
    
    // Reset file input
    const fileInput = document.querySelector(".media-file-input");
    if (fileInput) fileInput.value = "";
  };

  const openMediaModal = (index = 0) => {
    setModalMediaIndex(index);
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setShowMediaModal(false);
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

  const postToPlatformViaBackend = async (platform, content, media, mediaUrls) => {
    // Find the account for this platform
    const account = connectedAccounts.find(acc => acc.platform === platform);
    if (!account) {
      throw new Error(`${platform} account not found. Please reconnect your account.`);
    }

    console.log(`🚀 Posting to ${platform}:`, {
      hasContent: !!content,
      mediaCount: media.length,
      hasMediaUrls: !!mediaUrls,
      accountId: account.id,
      accountPlatform: account.platform,
      selectedPlatform: platform
    });

    const formData = new FormData();
    formData.append("content", content || "");

    // Separate images and videos
    const images = media.filter(item => item.mediaType === 'image');
    const videos = media.filter(item => item.mediaType === 'video');

    console.log('📊 Media breakdown:', {
      totalMedia: media.length,
      images: images.length,
      videos: videos.length,
      imageFiles: images.filter(item => item.type === 'file').length,
      videoFiles: videos.filter(item => item.type === 'file').length,
      imageUrls: images.filter(item => item.type === 'url').length,
      videoUrls: videos.filter(item => item.type === 'url').length
    });

    // Add image files
    images.forEach((image, index) => {
      if (image.type === 'file' && image.file) {
        formData.append(`images`, image.file);
      }
    });

    // Add video files
    videos.forEach((video, index) => {
      if (video.type === 'file' && video.file) {
        formData.append(`videos`, video.file);
      }
    });

    // Add media URLs (deduplicated)
    const urlList = Array.from(new Set([
      ...media.filter(item => item.type === 'url').map(item => item.url),
      ...(mediaUrls ? mediaUrls.split(',').map(url => url.trim()).filter(Boolean) : [])
    ].filter(Boolean)));
    
    if (urlList.length > 0) {
      formData.append("mediaUrls", urlList.join(','));
    }

    // Add authentication header
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    // Retry with backoff for HTTP 429
    const maxRetries = 3;
    let attempt = 0;
    let lastError;
    while (attempt <= maxRetries) {
      // Debug FormData contents before sending
      console.log('📤 FormData contents for', platform, ':');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await fetch(
        `${BACKEND_URL}/api/posting/${platform.toLowerCase()}/${account.id}`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
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

  // UPDATED: Multi-platform posting with media support
  const postToMultiplePlatformsViaBackend = async (
    platforms,
    content,
    media,
    mediaUrls
  ) => {
    const formData = new FormData();
    formData.append("content", content || "");
    formData.append("platforms", JSON.stringify(platforms));

    // Separate and add images and videos
    const images = media.filter(item => item.mediaType === 'image');
    const videos = media.filter(item => item.mediaType === 'video');

    images.forEach((image, index) => {
      if (image.type === 'file' && image.file) {
        formData.append(`images`, image.file);
      }
    });

    videos.forEach((video, index) => {
      if (video.type === 'file' && video.file) {
        formData.append(`videos`, video.file);
      }
    });

    // Add media URLs (deduplicated)
    const urlList = Array.from(new Set([
      ...media.filter(item => item.type === 'url').map(item => item.url),
      ...(mediaUrls ? mediaUrls.split(',').map(url => url.trim()).filter(Boolean) : [])
    ].filter(Boolean)));
    
    if (urlList.length > 0) {
      formData.append("mediaUrls", urlList.join(','));
    }

    // Add authentication header
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    console.log("📤 Sending multi-platform request:", {
      platforms,
      totalMedia: media.length,
      images: images.length,
      videos: videos.length,
      contentLength: content?.length || 0,
    });

    const response = await fetch(`${BACKEND_URL}/api/posting/multi`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
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
    const hasMedia = media.length > 0 || mediaUrls.trim();
    const hasPlatforms = selectedPlatforms.length > 0;

    if (!hasContent && !hasMedia) {
      showToast({
        message: "Please enter content or add media",
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

    // Check media limits for selected platforms
    const mediaLimit = getMediaLimit();
    if (media.length > mediaLimit) {
      showToast({
        message: `Too many files for selected platforms (max: ${mediaLimit})`,
        type: "warning",
      });
      return;
    }

    // Check video support
    const hasVideos = media.some(item => item.mediaType === 'video');
    if (hasVideos && !isVideoSupported()) {
      showToast({
        message: "Videos are not supported by all selected platforms",
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
        mediaCount: media.length,
        hasVideos,
        multiPlatform: selectedPlatforms.length > 1,
      });

      if (selectedPlatforms.length === 1) {
        // Single platform posting
        const platform = selectedPlatforms[0];
        console.log(`📤 Single platform posting to ${platform}`);

        const result = await postToPlatformViaBackend(
          platform,
          postContent,
          media,
          mediaUrls
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
          media,
          mediaUrls
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
        clearAllMedia();
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
      } else if (error.message.includes("credentials") || error.message.includes("account not found")) {
        showToast({
          message: `Authentication issue: ${error.message}`,
          type: "error",
        });
      } else if (error.message.includes("Cloudinary") || error.message.includes("media URLs")) {
        showToast({
          message: `Media upload issue: ${error.message}. Try using media URLs instead of file uploads.`,
          type: "warning",
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
  const mediaLimit = getMediaLimit();

  if (isLoadingAccounts) {
    return (
      <div className="post-now-section">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: 'var(--text-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(0, 198, 255, 0.3)',
              borderTop: '4px solid var(--accent-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Loading connected accounts...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  title={`Post to ${platform.name} (max ${platform.maxMedia} files${platform.supportsVideo ? ', supports video' : ''})`}
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

          {/* Media limit and video support indicators */}
          {selectedPlatforms.length > 0 && (
            <div className="media-limit-info">
              <small style={{color: "var(--text-muted)"}}>
                📁 Max {mediaLimit} files for selected platforms • {media.length} selected
                {isVideoSupported() && " • 🎬 Video supported"}
                {!isVideoSupported() && media.some(item => item.mediaType === 'video') && (
                  <span style={{color: "var(--error-color)"}}> • ⚠️ Video not supported by all platforms</span>
                )}
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

            {/* Multiple Media Upload Section */}
            <div className="media-upload-section">
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="media-file-input"
                  id="mediaUpload"
                />

                <input
                  type="text"
                  value={mediaUrls}
                  onChange={handleMediaUrlsChange}
                  placeholder="Or paste image/video URLs here (comma-separated)..."
                  className="media-url-input"
                />

                <div className="upload-buttons">
                  <label htmlFor="mediaUpload" className="media-upload-label">
                    <MdOutlineImage />
                    Add Images
                    <span className="upload-hint">({mediaLimit - media.filter(item => item.mediaType === 'image').length} remaining)</span>
                  </label>
                  
                  {isVideoSupported() && (
                    <label htmlFor="mediaUpload" className="media-upload-label video">
                      <MdVideoLibrary />
                      Add Videos
                      <span className="upload-hint">({getAllowedVideoFormats().join(', ')})</span>
                    </label>
                  )}
                  
                  {media.length > 0 && (
                    <button
                      type="button"
                      className="clear-media-btn"
                      onClick={clearAllMedia}
                      title="Clear all media"
                    >
                      <MdClose />
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Multiple Media Preview Grid */}
              {media.length > 0 && (
                <div className="media-preview-grid">
                  {media.map((mediaItem, index) => (
                    <div key={mediaItem.id} className="media-preview-item">
                      {mediaItem.mediaType === 'image' ? (
                        <img
                          src={mediaItem.preview}
                          alt={`Preview ${index + 1}`}
                          onClick={() => openMediaModal(index)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div className="video-preview" onClick={() => openMediaModal(index)}>
                          {mediaItem.type === 'file' ? (
                            <video
                              src={mediaItem.preview}
                              style={{ cursor: "pointer" }}
                              muted
                            />
                          ) : (
                            <div className="video-url-preview">
                              <MdVideoLibrary size={48} />
                              <span>Video URL</span>
                            </div>
                          )}
                          <div className="video-overlay">
                            <MdVideoLibrary size={24} />
                            <span>{formatFileSize(mediaItem.size || 0)}</span>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        className="remove-media-btn"
                        onClick={() => removeMedia(mediaItem.id)}
                        title="Remove media"
                      >
                        <MdClose />
                      </button>
                      <div className="media-info">
                        <small>{mediaItem.name}</small>
                        {mediaItem.type === 'file' && mediaItem.size && (
                          <small>{formatFileSize(mediaItem.size)}</small>
                        )}
                        {mediaItem.mediaType === 'video' && (
                          <small className="video-badge">🎬 Video</small>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add more media button */}
                  {media.length < mediaLimit && (
                    <label htmlFor="mediaUpload" className="add-more-media">
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
                {media.length > 0 && (
                  <span
                    style={{ marginLeft: "10px", color: "var(--success-color)" }}
                  >
                    📁 {media.length} file{media.length > 1 ? 's' : ''} 
                    ({media.filter(item => item.mediaType === 'image').length} images, {media.filter(item => item.mediaType === 'video').length} videos)
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="post-now-btn"
                disabled={
                  ((!postContent.trim() && media.length === 0) ||
                  selectedPlatforms.length === 0 ||
                  isPosting ||
                  connectedPlatforms.length === 0 ||
                  isOverLimit ||
                  media.length > mediaLimit ||
                  (media.some(item => item.mediaType === 'video') && !isVideoSupported()))
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

      {/* Media Modal with navigation */}
      {showMediaModal && media.length > 0 && (
        <div className="media-modal-overlay" onClick={closeMediaModal}>
          <div
            className="media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {media[modalMediaIndex]?.mediaType === 'image' ? (
              <img src={media[modalMediaIndex]?.preview} alt="Full size preview" />
            ) : (
              <video 
                src={media[modalMediaIndex]?.preview} 
                controls 
                autoPlay={false}
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
            )}
            
            {media.length > 1 && (
              <div className="modal-navigation">
                <button
                  className="nav-btn prev"
                  onClick={() => setModalMediaIndex(prev => 
                    prev === 0 ? media.length - 1 : prev - 1
                  )}
                  title="Previous media"
                >
                  ‹
                </button>
                <span className="media-counter">
                  {modalMediaIndex + 1} of {media.length}
                </span>
                <button
                  className="nav-btn next"
                  onClick={() => setModalMediaIndex(prev => 
                    prev === media.length - 1 ? 0 : prev + 1
                  )}
                  title="Next media"
                >
                  ›
                </button>
              </div>
            )}
            
            <button
              className="media-modal-close"
              onClick={closeMediaModal}
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
            {media.length > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "5px",
                }}
              >
                📁 Uploading {media.length} file{media.length > 1 ? 's' : ''} 
                ({media.filter(item => item.mediaType === 'image').length} images, {media.filter(item => item.mediaType === 'video').length} videos)
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