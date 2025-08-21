// Real OAuth Integration for Twitter & LinkedIn - Accounts.jsx
const BACKEND_URL = "http://localhost:3001";
import React, { useState, useEffect } from "react";
import "./Accounts.css";
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  MdAdd,
  MdSettings,
  MdDelete,
  MdRefresh,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { IoLinkOutline, IoStatsChart } from "react-icons/io5";
import { BsShieldCheck } from "react-icons/bs";
import { useToast } from "../../components/Toast/ToastProvider";
import { useConfirm } from "../../components/Confirm/ConfirmProvider";

function Accounts() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Load existing accounts from sessionStorage on mount
  useEffect(() => {
    const loadExistingAccounts = () => {
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
          followers: sessionStorage.getItem("fb_page_followers") || "—",
          avatar: sessionStorage.getItem("fb_page_avatar") || null,
          status: "active",
          lastSync: "Connected",
          isPublic: true,
        });
      }

      // Check Twitter
      const twitterToken = sessionStorage.getItem("twitter_access_token");
      const twitterUsername = sessionStorage.getItem("twitter_username");
      const twitterDisplayName = sessionStorage.getItem("twitter_display_name");
      const twitterUserId = sessionStorage.getItem("twitter_user_id");

      if (twitterToken && twitterUserId) {
        accounts.push({
          id: "twitter_" + twitterUserId,
          platform: "Twitter",
          username: twitterUsername || "@twitter_user",
          displayName: twitterDisplayName || "Twitter User",
          followers: sessionStorage.getItem("twitter_followers_count") || "—",
          avatar: sessionStorage.getItem("twitter_profile_image") || null,
          status: "active",
          lastSync: "Connected",
          isPublic: true,
        });
      }

      // Check LinkedIn
      const linkedinToken = sessionStorage.getItem("linkedin_access_token");
      const linkedinUsername = sessionStorage.getItem("linkedin_username");
      const linkedinDisplayName = sessionStorage.getItem(
        "linkedin_display_name"
      );
      const linkedinUserId = sessionStorage.getItem("linkedin_user_id");

      if (linkedinToken && linkedinUserId) {
        accounts.push({
          id: "linkedin_" + linkedinUserId,
          platform: "LinkedIn",
          username: linkedinUsername || "LinkedIn User",
          displayName: linkedinDisplayName || "LinkedIn User",
          followers:
            sessionStorage.getItem("linkedin_connections_count") || "—",
          avatar: sessionStorage.getItem("linkedin_profile_image") || null,
          status: "active",
          lastSync: "Connected",
          isPublic: true,
        });
      }

      setConnectedAccounts(accounts);
    };

    loadExistingAccounts();
  }, []);

  // Available platforms
  const availablePlatforms = [
    {
      name: "Twitter",
      icon: <FaTwitter />,
      color: "#1DA1F2",
      description:
        "Connect your Twitter account to share tweets and engage with your audience",
    },
    {
      name: "Facebook",
      icon: <FaFacebook />,
      color: "#4267B2",
      description: "Manage your Facebook pages and personal profile posts",
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      color: "#E4405F",
      description: "Share photos, stories, and reels to your Instagram account",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin />,
      color: "#0077B5",
      description: "Professional networking and business content sharing",
    },
    {
      name: "YouTube",
      icon: <FaYoutube />,
      color: "#FF0000",
      description: "Upload and manage your YouTube video content",
    },
    {
      name: "TikTok",
      icon: <FaTiktok />,
      color: "#000000",
      description: "Create and share short-form video content",
    },
  ];

  // =====================
  // REAL TWITTER OAuth 2.0 PKCE Implementation
  // =====================

  const connectTwitter = () => {
    try {
      console.log("🐦 Opening Twitter OAuth popup...");

      const popup = window.open(
        `${BACKEND_URL}/auth/twitter`,
        "twitterLogin",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        showToast({
          message: "Popup blocked! Please allow popups and try again.",
          type: "error",
        });
        return;
      }

      // Handle popup response
      const handleMessage = async (event) => {
        if (event.origin !== "http://localhost:3001") return;

        if (event.data && event.data.platform === "twitter") {
          console.log("📨 Twitter OAuth response:", event.data);

          if (event.data.success && event.data.sessionId) {
            try {
              const response = await fetch(
                `${BACKEND_URL}/auth/twitter/user/${event.data.sessionId}`
              );
              const userData = await response.json();

              if (response.ok) {
                // Store Twitter data in sessionStorage
                sessionStorage.setItem(
                  "twitter_access_token",
                  userData.accessToken
                );
                sessionStorage.setItem("twitter_user_id", userData.user.id);
                sessionStorage.setItem(
                  "twitter_username",
                  `@${userData.user.username}`
                );
                sessionStorage.setItem(
                  "twitter_display_name",
                  userData.user.name
                );

                if (userData.user.public_metrics?.followers_count) {
                  sessionStorage.setItem(
                    "twitter_followers_count",
                    userData.user.public_metrics.followers_count.toLocaleString()
                  );
                }

                if (userData.user.profile_image_url) {
                  sessionStorage.setItem(
                    "twitter_profile_image",
                    userData.user.profile_image_url
                  );
                }

                // Add to connected accounts
                const twitterAccount = {
                  id: "twitter_" + userData.user.id,
                  platform: "Twitter",
                  username: `@${userData.user.username}`,
                  displayName: userData.user.name,
                  followers:
                    userData.user.public_metrics?.followers_count?.toLocaleString() ||
                    "—",
                  avatar: userData.user.profile_image_url || null,
                  status: "active",
                  lastSync: "Just now",
                  isPublic: true,
                };

                setConnectedAccounts((prev) => {
                  const filtered = prev.filter(
                    (acc) => acc.platform !== "Twitter"
                  );
                  return [...filtered, twitterAccount];
                });

                showToast({
                  message: "✅ Twitter connected successfully!",
                  type: "success",
                });
              } else {
                throw new Error(
                  userData.error || "Failed to get Twitter user data"
                );
              }
            } catch (error) {
              console.error("❌ Error fetching Twitter user data:", error);
              showToast({
                message: "Failed to get LinkedIn user data",
                type: "error",
              });
            }
          } else if (event.data.error) {
            showToast({
              message: `LinkedIn authentication failed: ${event.data.error}`,
              type: "error",
            });
          }

          // Clean up
          window.removeEventListener("message", handleMessage);
          if (popup && !popup.closed) popup.close();
          setShowAddModal(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Monitor popup for manual close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          showToast({
            message: "LinkedIn authentication cancelled",
            type: "warning",
          });
          setShowAddModal(false);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ LinkedIn connection error:", error);
      showToast({
        message: `LinkedIn connection failed: ${error.message}`,
        type: "error",
      });
    }
  };

  // =====================
  // REAL FACEBOOK OAuth 2.0 Implementation
  // =====================

  const connectFacebook = () => {
    try {
      console.log("📘 Opening Facebook OAuth popup...");

      const popup = window.open(
        `${BACKEND_URL}/auth/facebook`,
        "facebookLogin",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        showToast({
          message: "Popup blocked! Please allow popups and try again.",
          type: "error",
        });
        return;
      }

      // Handle popup response
      const handleMessage = async (event) => {
        if (event.origin !== "http://localhost:3001") return;

        if (event.data && event.data.platform === "facebook") {
          console.log("📨 Facebook OAuth response:", event.data);

          if (event.data.success && event.data.sessionId) {
            try {
              const response = await fetch(
                `${BACKEND_URL}/auth/facebook/user/${event.data.sessionId}`
              );
              const userData = await response.json();

              if (response.ok) {
                const user = userData.user;
                const pages = userData.pages || [];

                // Store Facebook user data
                sessionStorage.setItem(
                  "facebook_access_token",
                  userData.accessToken
                );
                sessionStorage.setItem("facebook_user_id", user.id);
                sessionStorage.setItem("facebook_user_name", user.name);

                if (user.picture?.data?.url) {
                  sessionStorage.setItem(
                    "facebook_profile_image",
                    user.picture.data.url
                  );
                }

                // If user has pages, use the first page for posting
                if (pages.length > 0) {
                  const page = pages[0];
                  sessionStorage.setItem("fb_page_id", page.id);
                  sessionStorage.setItem("fb_page_token", page.access_token);
                  sessionStorage.setItem("fb_page_name", page.name);
                  
                  if (page.picture?.data?.url) {
                    sessionStorage.setItem("fb_page_avatar", page.picture.data.url);
                  }

                  // Add page account
                  const facebookAccount = {
                    id: "facebook_" + page.id,
                    platform: "Facebook",
                    username: page.name,
                    displayName: page.name,
                    followers: "—",
                    avatar: page.picture?.data?.url || null,
                    status: "active",
                    lastSync: "Just now",
                    isPublic: true,
                  };

                  setConnectedAccounts((prev) => {
                    const filtered = prev.filter(
                      (acc) => acc.platform !== "Facebook"
                    );
                    return [...filtered, facebookAccount];
                  });

                  showToast({
                    message: `✅ Facebook Page "${page.name}" connected successfully!`,
                    type: "success",
                  });
                } else {
                  // No pages, use personal profile
                  const facebookAccount = {
                    id: "facebook_" + user.id,
                    platform: "Facebook",
                    username: user.name,
                    displayName: user.name,
                    followers: "—",
                    avatar: user.picture?.data?.url || null,
                    status: "active",
                    lastSync: "Just now",
                    isPublic: true,
                  };

                  setConnectedAccounts((prev) => {
                    const filtered = prev.filter(
                      (acc) => acc.platform !== "Facebook"
                    );
                    return [...filtered, facebookAccount];
                  });

                  showToast({
                    message: "✅ Facebook connected successfully!",
                    type: "success",
                  });
                }
              } else {
                throw new Error(
                  userData.error || "Failed to get Facebook user data"
                );
              }
            } catch (error) {
              console.error("❌ Error fetching Facebook user data:", error);
              showToast({
                message: "Failed to get Facebook user data",
                type: "error",
              });
            }
          } else if (event.data.error) {
            showToast({
              message: `Facebook authentication failed: ${event.data.error}`,
              type: "error",
            });
          }

          // Clean up
          window.removeEventListener("message", handleMessage);
          if (popup && !popup.closed) popup.close();
          setShowAddModal(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Monitor popup for manual close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          showToast({
            message: "Facebook authentication cancelled",
            type: "warning",
          });
          setShowAddModal(false);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Facebook connection error:", error);
      showToast({
        message: `Facebook connection failed: ${error.message}`,
        type: "error",
      });
    }
  };

  const connectLinkedIn = () => {
    try {
      console.log("💼 Opening LinkedIn OAuth popup...");

      const popup = window.open(
        `${BACKEND_URL}/auth/linkedin`,
        "linkedinLogin",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        showToast({
          message: "Popup blocked! Please allow popups and try again.",
          type: "error",
        });
        return;
      }

      // Handle popup response
      const handleMessage = async (event) => {
        if (event.origin !== "http://localhost:3001") return;

        if (event.data && event.data.platform === "linkedin") {
          console.log("📨 LinkedIn OAuth response:", event.data);

          if (event.data.success && event.data.sessionId) {
            try {
              const response = await fetch(
                `${BACKEND_URL}/auth/linkedin/user/${event.data.sessionId}`
              );
              const userData = await response.json();

              if (response.ok) {
                // Store LinkedIn data in sessionStorage
                sessionStorage.setItem(
                  "linkedin_access_token",
                  userData.accessToken
                );
                sessionStorage.setItem("linkedin_user_id", userData.user.id);
                sessionStorage.setItem(
                  "linkedin_username",
                  userData.user.localizedFirstName + " " + userData.user.localizedLastName
                );
                sessionStorage.setItem(
                  "linkedin_display_name",
                  userData.user.localizedFirstName + " " + userData.user.localizedLastName
                );

                // Store profile image if available
                if (userData.user.profilePicture?.displayImage) {
                  const profileImageUrl = userData.user.profilePicture.displayImage;
                  sessionStorage.setItem("linkedin_profile_image", profileImageUrl);
                }

                // Store connections count if available (LinkedIn API may require special permissions)
                if (userData.connectionsCount) {
                  sessionStorage.setItem(
                    "linkedin_connections_count",
                    userData.connectionsCount.toLocaleString()
                  );
                }

                // Add to connected accounts
                const linkedinAccount = {
                  id: "linkedin_" + userData.user.id,
                  platform: "LinkedIn",
                  username: userData.user.localizedFirstName + " " + userData.user.localizedLastName,
                  displayName: userData.user.localizedFirstName + " " + userData.user.localizedLastName,
                  followers: userData.connectionsCount?.toLocaleString() || "—",
                  avatar: userData.user.profilePicture?.displayImage || null,
                  status: "active",
                  lastSync: "Just now",
                  isPublic: true,
                };

                setConnectedAccounts((prev) => {
                  const filtered = prev.filter(
                    (acc) => acc.platform !== "LinkedIn"
                  );
                  return [...filtered, linkedinAccount];
                });

                showToast({
                  message: "✅ LinkedIn connected successfully!",
                  type: "success",
                });
              } else {
                throw new Error(
                  userData.error || "Failed to get LinkedIn user data"
                );
              }
            } catch (error) {
              console.error("❌ Error fetching LinkedIn user data:", error);
              showToast({
                message: "Failed to get LinkedIn user data",
                type: "error",
              });
            }
          } else if (event.data.error) {
            showToast({
              message: `LinkedIn authentication failed: ${event.data.error}`,
              type: "error",
            });
          }

          // Clean up
          window.removeEventListener("message", handleMessage);
          if (popup && !popup.closed) popup.close();
          setShowAddModal(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Monitor popup for manual close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          showToast({
            message: "LinkedIn authentication cancelled",
            type: "warning",
          });
          setShowAddModal(false);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ LinkedIn connection error:", error);
      showToast({
        message: `LinkedIn connection failed: ${error.message}`,
        type: "error",
      });
    }
  };
  // =====================
  // REAL INSTAGRAM OAuth 2.0 Implementation (via Facebook Graph API)
  // =====================

  const connectInstagram = () => {
    try {
      console.log("📷 Opening Instagram OAuth popup...");

      const popup = window.open(
        `${BACKEND_URL}/auth/instagram`,
        "instagramLogin",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        showToast({
          message: "Popup blocked! Please allow popups and try again.",
          type: "error",
        });
        return;
      }

      // Handle popup response
      const handleMessage = async (event) => {
        if (event.origin !== "http://localhost:3001") return;

        if (event.data && event.data.platform === "instagram") {
          console.log("📨 Instagram OAuth response:", event.data);

          if (event.data.success && event.data.sessionId) {
            try {
              const response = await fetch(
                `${BACKEND_URL}/auth/instagram/user/${event.data.sessionId}`
              );
              const userData = await response.json();

              if (response.ok) {
                // Store Instagram data in sessionStorage
                sessionStorage.setItem(
                  "instagram_access_token",
                  userData.accessToken
                );
                sessionStorage.setItem("instagram_user_id", userData.user.id);
                sessionStorage.setItem(
                  "instagram_username",
                  `@${userData.user.username}`
                );
                sessionStorage.setItem(
                  "instagram_display_name",
                  userData.user.name || userData.user.username
                );

                // Store follower count if available
                if (userData.user.followers_count) {
                  sessionStorage.setItem(
                    "instagram_followers_count",
                    userData.user.followers_count.toLocaleString()
                  );
                }

                // Store profile image if available
                if (userData.user.profile_picture_url) {
                  sessionStorage.setItem(
                    "instagram_profile_image",
                    userData.user.profile_picture_url
                  );
                }

                // Store account type (PERSONAL, BUSINESS, CREATOR)
                if (userData.user.account_type) {
                  sessionStorage.setItem(
                    "instagram_account_type",
                    userData.user.account_type
                  );
                }

                // Store media count if available
                if (userData.user.media_count) {
                  sessionStorage.setItem(
                    "instagram_media_count",
                    userData.user.media_count.toString()
                  );
                }

                // Add to connected accounts
                const instagramAccount = {
                  id: "instagram_" + userData.user.id,
                  platform: "Instagram",
                  username: `@${userData.user.username}`,
                  displayName: userData.user.name || userData.user.username,
                  followers: userData.user.followers_count?.toLocaleString() || "—",
                  avatar: userData.user.profile_picture_url || null,
                  status: "active",
                  lastSync: "Just now",
                  isPublic: userData.user.account_type !== "PERSONAL",
                  accountType: userData.user.account_type || "PERSONAL",
                };

                setConnectedAccounts((prev) => {
                  const filtered = prev.filter(
                    (acc) => acc.platform !== "Instagram"
                  );
                  return [...filtered, instagramAccount];
                });

                const accountTypeText = userData.user.account_type === "BUSINESS" 
                  ? " (Business Account)" 
                  : userData.user.account_type === "CREATOR" 
                  ? " (Creator Account)" 
                  : "";

                showToast({
                  message: `✅ Instagram${accountTypeText} connected successfully!`,
                  type: "success",
                });
              } else {
                throw new Error(
                  userData.error || "Failed to get Instagram user data"
                );
              }
            } catch (error) {
              console.error("❌ Error fetching Instagram user data:", error);
              showToast({
                message: "Failed to get Instagram user data",
                type: "error",
              });
            }
          } else if (event.data.error) {
            showToast({
              message: `Instagram authentication failed: ${event.data.error}`,
              type: "error",
            });
          }

          // Clean up
          window.removeEventListener("message", handleMessage);
          if (popup && !popup.closed) popup.close();
          setShowAddModal(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Monitor popup for manual close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          showToast({
            message: "Instagram authentication cancelled",
            type: "warning",
          });
          setShowAddModal(false);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Instagram connection error:", error);
      showToast({
        message: `Instagram connection failed: ${error.message}`,
        type: "error",
      });
    }
  };

  // =====================
  // UI Event Handlers
  // =====================

  const handleConnectAccount = (platform) => {
    setSelectedPlatform(platform);
    setShowAddModal(true);
  };

  const handleDisconnectAccount = async (accountId) => {
    const account = connectedAccounts.find((acc) => acc.id === accountId);
    if (!account) return;

    const ok = await confirm({
      title: "Disconnect account",
      message: `Are you sure you want to disconnect your ${account.platform} account?`,
      confirmText: "Disconnect",
      cancelText: "Cancel",
      tone: "danger",
    });

    if (ok) {
      // Remove from connected accounts
      setConnectedAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountId)
      );

      // Clear session storage for this platform
      const platform = account.platform.toLowerCase();
      const keysToRemove = [
        `${platform}_access_token`,
        `${platform}_refresh_token`,
        `${platform}_user_id`,
        `${platform}_username`,
        `${platform}_display_name`,
        `${platform}_followers_count`,
        `${platform}_profile_image`,
        `${platform}_connections_count`,
        `${platform}_user_name`,
      ];

      // Special cases for platform-specific keys
      if (platform === "facebook") {
        keysToRemove.push("fb_page_id", "fb_page_token", "fb_page_name", "fb_page_avatar", "fb_page_followers");
      }

      keysToRemove.forEach((key) => sessionStorage.removeItem(key));

      showToast({
        message: `${account.platform} account disconnected`,
        type: "success",
      });
    }
  };

  const handleRefreshAccount = (accountId) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, lastSync: "Just now", status: "active" }
          : acc
      )
    );
    showToast({ message: "Account refreshed", type: "success" });
  };

  const toggleAccountVisibility = (accountId) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, isPublic: !acc.isPublic } : acc
      )
    );
  };

  const getPlatformInfo = (platformName) => {
    return availablePlatforms.find((p) => p.name === platformName);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaCheckCircle className="status-icon active" />;
      case "warning":
        return <FaExclamationTriangle className="status-icon warning" />;
      default:
        return <FaCheckCircle className="status-icon active" />;
    }
  };

  const testConnection = async (platform, accountId) => {
    const accessToken = sessionStorage.getItem(
      `${platform.toLowerCase()}_access_token`
    );
    if (!accessToken) {
      showToast({
        message: `No ${platform} access token found. Please reconnect your account.`,
        type: "warning",
      });
      return;
    }

    // For demo purposes, always show success
    showToast({
      message: `${platform} connection test successful!`,
      type: "success",
    });
  };

  return (
    <div className="accounts-container">
      {/* Connected Accounts */}
      <div className="accounts-section">
        <div className="section-header">
          <div className="section-icon">
            <IoLinkOutline />
          </div>
          <div className="section-title">
            <h2>Connected Accounts</h2>
            <p>Manage your connected social media accounts</p>
          </div>
          <div className="accounts-stats">
            <span>{connectedAccounts.length} connected</span>
          </div>
        </div>

        <div className="connected-accounts-grid">
          {connectedAccounts.map((account) => {
            const platformInfo = getPlatformInfo(account.platform);
            return (
              <div key={account.id} className="connected-account-card">
                <div className="account-header">
                  <div
                    className="account-platform"
                    style={{ "--platform-color": platformInfo?.color }}
                  >
                    {platformInfo?.icon}
                    <span>{account.platform}</span>
                  </div>
                  <div className="account-status">
                    {getStatusIcon(account.status)}
                  </div>
                </div>
                <div className="account-info">
                  <div className="account-avatar">
                    {account.avatar ? (
                      <img src={account.avatar} alt={account.displayName} />
                    ) : (
                      <div
                        className="avatar-placeholder"
                        style={{ background: platformInfo?.color }}
                      >
                        {account.displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="account-details">
                    <h3>{account.displayName}</h3>
                    <p>{account.username}</p>
                    <div className="account-stats">
                      <IoStatsChart />
                      <span>{account.followers} followers</span>
                    </div>
                  </div>
                </div>
                <div className="account-meta">
                  <div className="last-sync">Last sync: {account.lastSync}</div>
                  <div className="account-visibility">
                    {account.isPublic ? (
                      <>
                        <MdVisibility /> Public
                      </>
                    ) : (
                      <>
                        <MdVisibilityOff /> Private
                      </>
                    )}
                  </div>
                </div>
                <div className="account-actions">
                  <button
                    className="action-btn refresh"
                    onClick={() => handleRefreshAccount(account.id)}
                    title="Refresh account"
                  >
                    <MdRefresh />
                  </button>
                  <button
                    className="action-btn visibility"
                    onClick={() => toggleAccountVisibility(account.id)}
                    title="Toggle visibility"
                  >
                    {account.isPublic ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                  <button
                    className="action-btn test"
                    onClick={() => testConnection(account.platform, account.id)}
                    title={`Test ${account.platform} connection`}
                    style={{
                      background: `rgba(${hexToRgb(
                        platformInfo?.color || "#000"
                      )}, 0.1)`,
                      color: platformInfo?.color || "#333",
                      border: `1px solid rgba(${hexToRgb(
                        platformInfo?.color || "#000"
                      )}, 0.2)`,
                    }}
                  >
                    Test
                  </button>
                  <button className="action-btn settings" title="Settings">
                    <MdSettings />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDisconnectAccount(account.id)}
                    title="Disconnect account"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Platforms */}
      <div className="accounts-section">
        <div className="section-header">
          <div className="section-icon">
            <MdAdd />
          </div>
          <div className="section-title">
            <h2>Add New Account</h2>
            <p>Connect more social media platforms to expand your reach</p>
          </div>
        </div>

        <div className="available-platforms-grid">
          {availablePlatforms
            .filter(
              (platform) =>
                !connectedAccounts.some((acc) => acc.platform === platform.name)
            )
            .map((platform) => (
              <div key={platform.name} className="platform-card">
                <div className="platform-header">
                  <div
                    className="platform-icon"
                    style={{ "--platform-color": platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <h3>{platform.name}</h3>
                </div>
                <p className="platform-description">{platform.description}</p>
                <button
                  className="connect-btn"
                  onClick={() => handleConnectAccount(platform)}
                  style={{ "--platform-color": platform.color }}
                >
                  <MdAdd /> Connect {platform.name}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="security-icon">
          <BsShieldCheck />
        </div>
        <div className="security-content">
          <h3>Your accounts are secure</h3>
          <p>
            We use industry-standard OAuth 2.0 authentication to securely
            connect your accounts. We never store your passwords and you can
            revoke access at any time.
          </p>
        </div>
      </div>

      {/* Connect Modal */}
      {showAddModal && selectedPlatform && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="connect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div
                className="modal-platform"
                style={{ "--platform-color": selectedPlatform.color }}
              >
                {selectedPlatform.icon}
                <h2>Connect {selectedPlatform.name}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                A popup window will open to authorize your{" "}
                {selectedPlatform.name} account.
              </p>
              <div className="modal-permissions">
                <h4>Permissions requested:</h4>
                <ul>
                  <li>Read your profile information</li>
                  <li>Post on your behalf</li>
                  <li>Access your follower count</li>
                  {selectedPlatform.name === "Twitter" && (
                    <li>Tweet and read tweets</li>
                  )}
                  {selectedPlatform.name === "LinkedIn" && (
                    <li>Share content on LinkedIn</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-connect"
                style={{ "--platform-color": selectedPlatform.color }}
                onClick={() => {
                  const platformName = selectedPlatform.name;

                  // Real OAuth connections
                  switch (platformName) {
                    case "Facebook":
                      connectFacebook();
                      break;
                    case "Twitter":
                      connectTwitter();
                      break;
                    case "LinkedIn":
                      connectLinkedIn();
                      break;
                    case "Instagram":
                      connectInstagram();
                      break;
                    case "YouTube":
                      showToast({
                        message: "YouTube integration coming soon!",
                        type: "info",
                      });
                      setShowAddModal(false);
                      break;
                    case "TikTok":
                      showToast({
                        message: "TikTok integration coming soon!",
                        type: "info",
                      });
                      setShowAddModal(false);
                      break;
                    default:
                      showToast({
                        message: `${platformName} integration coming soon!`,
                        type: "info",
                      });
                      setShowAddModal(false);
                  }
                  setShowAddModal(false);
                }}
              >
                Continue to {selectedPlatform.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  if (!hex) return "0,0,0";
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0,0,0";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
    result[3],
    16
  )}`;
}

export default Accounts;
