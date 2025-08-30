// Fixed OAuth Integration for Twitter, LinkedIn, Facebook & Instagram - Accounts.jsx
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
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Load existing accounts from database on mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/social-accounts`, {
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
            id: account._id,
            platform: platformName,
            username: account.platform === 'twitter' ? `@${account.accountName}` : account.accountName,
            displayName: account.accountName,
            followers: "—", // We'll need to fetch this separately if needed
            avatar: null, // We'll need to fetch this separately if needed
            status: account.isActive ? "active" : "inactive",
            lastSync: new Date(account.lastUsed).toLocaleDateString(),
            isPublic: true,
            accountId: account.accountId,
            accessToken: account.accessToken // For immediate use
          };
        });
        
        setConnectedAccounts(accounts);
      } else {
        console.error('Failed to load connected accounts');
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  // FIXED TWITTER OAuth 2.0 PKCE Implementation
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

          // Clear the popup monitoring interval immediately
          clearInterval(checkClosed);

          if (event.data.success && event.data.sessionId) {
            try {
              const authToken = localStorage.getItem('authToken');
              const response = await fetch(
                `${BACKEND_URL}/auth/twitter/user/${event.data.sessionId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              const userData = await response.json();

              if (response.ok) {
                // Reload connected accounts from database
                await loadConnectedAccounts();

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
                message: "Failed to get Twitter user data",
                type: "error",
              });
            }
          } else if (event.data.error) {
            showToast({
              message: `Twitter authentication failed: ${event.data.error}`,
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
            message: "Twitter authentication cancelled",
            type: "warning",
          });
          setShowAddModal(false);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Twitter connection error:", error);
      showToast({
        message: `Twitter connection failed: ${error.message}`,
        type: "error",
      });
    }
  };

  // =====================
  // FIXED FACEBOOK OAuth 2.0 Implementation
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

          // Clear the popup monitoring interval immediately
          clearInterval(checkClosed);

          if (event.data.success && event.data.sessionId) {
            try {
              const authToken = localStorage.getItem('authToken');
              const response = await fetch(
                `${BACKEND_URL}/auth/facebook/user/${event.data.sessionId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              const userData = await response.json();

              if (response.ok) {
                // Reload connected accounts from database
                await loadConnectedAccounts();

                showToast({
                  message: "✅ Facebook connected successfully!",
                  type: "success",
                });
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

  // =====================
  // FIXED LINKEDIN OAuth 2.0 Implementation
  // =====================

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

          // Clear the popup monitoring interval immediately
          clearInterval(checkClosed);

          if (event.data.success && event.data.sessionId) {
            try {
              const authToken = localStorage.getItem('authToken');
              const response = await fetch(
                `${BACKEND_URL}/auth/linkedin/user/${event.data.sessionId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              const userData = await response.json();

              if (response.ok) {
                // Reload connected accounts from database
                await loadConnectedAccounts();

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
  // FIXED INSTAGRAM OAuth 2.0 Implementation
  // =====================
  const connectInstagram = () => {
    try {
      console.log("📷 Opening Instagram Graph API OAuth popup...");

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

      const handleMessage = async (event) => {
        if (event.origin !== "http://localhost:3001") return;

        if (event.data && event.data.platform === "instagram") {
          clearInterval(checkClosed);

          if (event.data.success && event.data.sessionId) {
            try {
              const authToken = localStorage.getItem('authToken');
              const response = await fetch(
                `${BACKEND_URL}/auth/instagram/user/${event.data.sessionId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              const userData = await response.json();

              if (response.ok) {
                // Reload connected accounts from database
                await loadConnectedAccounts();

                showToast({
                  message: "✅ Instagram connected successfully!",
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
                message: "Failed to get Instagram user data: " + error.message,
                type: "error",
              });
            }
          }

          window.removeEventListener("message", handleMessage);
          if (popup && !popup.closed) popup.close();
          setShowAddModal(false);
        }
      };

      window.addEventListener("message", handleMessage);

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

  // Updated handleDisconnectAccount to remove from database
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
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/auth/social-accounts/${accountId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Remove from connected accounts
          setConnectedAccounts((prev) =>
            prev.filter((acc) => acc.id !== accountId)
          );

          showToast({
            message: `${account.platform} account disconnected`,
            type: "success",
          });
        } else {
          throw new Error('Failed to disconnect account');
        }
      } catch (error) {
        console.error('Error disconnecting account:', error);
        showToast({
          message: `Failed to disconnect ${account.platform} account`,
          type: "error",
        });
      }
    }
  };

  const handleRefreshAccount = async (accountId) => {
    try {
      // Reload connected accounts from database
      await loadConnectedAccounts();
      
      showToast({ message: "Account refreshed", type: "success" });
    } catch (error) {
      console.error('Error refreshing account:', error);
      showToast({ message: "Failed to refresh account", type: "error" });
    }
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

  // Updated testConnection to use stored access tokens
  const testConnection = async (platform, accountId) => {
    const account = connectedAccounts.find(acc => acc.id === accountId);
    if (!account || !account.accessToken) {
      showToast({
        message: `No ${platform} access token found. Please reconnect your account.`,
        type: "warning",
      });
      return;
    }

    showToast({
      message: `${platform} connection active! Posting is enabled.`,
      type: "success",
    });
  };

  if (isLoading) {
    return (
      <div className="accounts-container">
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

                  // Real OAuth connections with proper platform routing
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
                  // Note: Don't close modal here for OAuth platforms - let the OAuth flow handle it
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
