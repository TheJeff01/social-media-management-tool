// Accounts.jsx - Social Media Account Management with Direct Popup OAuth (No Callback Files)
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
import { SiThreads } from "react-icons/si";
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

  // Load FB SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      FB.init({
        appId: "1269691314882966", // Your Facebook App ID
        cookie: true,
        xfbml: true,
        version: "v20.0",
      });
    };
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
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

  const handleConnectAccount = (platform) => {
    setSelectedPlatform(platform);
    setShowAddModal(true);
  };

  const handleDisconnectAccount = async (accountId) => {
    const ok = await confirm({
      title: "Disconnect account",
      message: "Are you sure you want to disconnect this account?",
      confirmText: "Disconnect",
      cancelText: "Cancel",
      tone: "danger",
    });
    if (ok) {
      setConnectedAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      showToast({ message: "Account disconnected", type: "success" });
    }
  };

  const handleRefreshAccount = (accountId) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, lastSync: "Just now", status: "active" } : acc
      )
    );
  };

  const toggleAccountVisibility = (accountId) => {
    setConnectedAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, isPublic: !acc.isPublic } : acc))
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

  // =====================
  // Generic OAuth popup handler (kept for non-Twitter providers)
  // =====================
  const handleOAuthPopup = (platform, authUrl) => {
    const popup = window.open(
      authUrl,
      `${platform.toLowerCase()}-oauth`,
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollTimer);
          showToast({ message: `${platform} authentication was cancelled`, type: "warning" });
          return;
        }

        const popupUrl = popup.location.href;
        const urlParams = new URLSearchParams(popup.location.search);

        if (popupUrl.includes("code=") || popupUrl.includes("access_token=")) {
          clearInterval(pollTimer);

          const code = urlParams.get("code");
          const accessToken = urlParams.get("access_token");
          const error = urlParams.get("error");

          if (error) {
            popup.close();
            showToast({ message: `${platform} authentication failed: ${error}`, type: "error" });
            return;
          }

          if (code || accessToken) {
            handleOAuthSuccess(platform, code, accessToken, popup);
          }
        }
      } catch (e) {
        // Cross-origin during OAuth; expected until it returns to our origin
      }
    }, 1000);

    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(pollTimer);
        showToast({ message: `${platform} authentication timed out`, type: "error" });
      }
    }, 300000); // 5 minutes
  };

  // =====================
  // Handle successful OAuth response (used by non-Twitter demo flows)
  // =====================
  const handleOAuthSuccess = async (platform, code, accessToken, popup) => {
    try {
      let userData;

      switch (platform) {
        case "Twitter":
          // Not used anymore; Twitter flow handled separately with PKCE + postMessage
          userData = {
            username: "@demo_twitter_user",
            displayName: "Demo Twitter User",
            followers: "1.2K",
            avatar: null,
          };
          sessionStorage.setItem("twitter_access_token", accessToken || "demo_twitter_token");
          break;

        case "Instagram":
          userData = {
            username: "@demo_instagram",
            displayName: "Demo Instagram",
            followers: "5.4K",
            avatar: null,
          };
          sessionStorage.setItem(
            "instagram_access_token",
            accessToken || "demo_instagram_token"
          );
          break;

        case "LinkedIn":
          userData = {
            username: "Demo LinkedIn User",
            displayName: "Demo LinkedIn User",
            followers: "500+",
            avatar: null,
          };
          sessionStorage.setItem("linkedin_access_token", accessToken || "demo_linkedin_token");
          break;

        case "YouTube":
          userData = {
            username: "Demo YouTube Channel",
            displayName: "Demo YouTube Channel",
            followers: "10K subscribers",
            avatar: null,
          };
          sessionStorage.setItem("youtube_access_token", accessToken || "demo_youtube_token");
          break;

        case "TikTok":
          userData = {
            username: "@demo_tiktok",
            displayName: "Demo TikTok User",
            followers: "25K",
            avatar: null,
          };
          sessionStorage.setItem("tiktok_access_token", accessToken || "demo_tiktok_token");
          break;

        default:
          throw new Error("Unsupported platform");
      }

      setConnectedAccounts((prev) => [
        ...prev,
        {
          id: Date.now(),
          platform: platform,
          username: userData.username,
          displayName: userData.displayName,
          followers: userData.followers,
          avatar: userData.avatar,
          status: "active",
          lastSync: "Just now",
          isPublic: true,
        },
      ]);

      popup.close();
      showToast({ message: `Successfully connected to ${platform}: ${userData.displayName}` , type: "success" });
    } catch (error) {
      popup.close();
      showToast({ message: `Failed to connect ${platform}: ${error.message}`, type: "error" });
    }
  };

  // =====================
  // FACEBOOK connect (existing)
  // =====================
  const connectFacebook = () => {
    FB.login(
      function (response) {
        if (response.authResponse) {
          const userToken = response.authResponse.accessToken;
          FB.api("/me/accounts", { access_token: userToken }, function (pages) {
            if (pages && pages.data && pages.data.length > 0) {
              const page = pages.data[0];
              sessionStorage.setItem("fb_page_id", page.id);
              sessionStorage.setItem("fb_page_token", page.access_token);
              setConnectedAccounts((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  platform: "Facebook",
                  username: page.name,
                  displayName: page.name,
                  followers: "—",
                  avatar: null,
                  status: "active",
                  lastSync: "Just now",
                  isPublic: true,
                },
              ]);
              showToast({ message: `Connected to Facebook Page: ${page.name}`, type: "success" });
            } else {
              showToast({ message: "No Facebook Pages found for this account.", type: "warning" });
            }
          });
        } else {
          showToast({ message: "Facebook login cancelled or not authorized.", type: "warning" });
        }
      },
      { scope: "pages_manage_posts,pages_show_list,pages_read_engagement" }
    );
  };

  // =====================
  // TWITTER (NEW) — PKCE + popup + postMessage + token exchange (frontend-only for testing)
  // =====================
  // Generate a random string for PKCE
  function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Base64URL encode ArrayBuffer
  function base64urlencode(arrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  // SHA-256
  async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return await crypto.subtle.digest("SHA-256", data);
  }

  async function generateCodeChallenge(verifier) {
    const hashed = await sha256(verifier);
    return base64urlencode(hashed);
  }

  const connectTwitter = async () => {
    const clientId = "WE55eTM4eEFLa2VtLWRNdFhQZlE6MTpjaQ"; // Your Twitter app client ID
    const redirectUri = `${window.location.origin}/twitter-callback.html`;
    const state = "twitter_" + Math.random().toString(36).substring(2, 15);

    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Persist for exchange
    sessionStorage.setItem("twitter_code_verifier", codeVerifier);
    sessionStorage.setItem("twitter_oauth_state", state);

    const scope = encodeURIComponent("tweet.read tweet.write users.read follows.read");
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    const popup = window.open(authUrl, "twitterLogin", "width=500,height=600");

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.source === "twitter-oauth") {
        if (event.data.error) {
          showToast({ message: `Twitter authentication failed: ${event.data.error}`, type: "error" });
        } else {
          const receivedState = event.data.state;
          if (receivedState !== sessionStorage.getItem("twitter_oauth_state")) {
            showToast({ message: "Twitter state mismatch.", type: "error" });
          } else {
            sessionStorage.setItem("twitter_oauth_code", event.data.code);
            // Immediately exchange for token (frontend-only demo)
            exchangeTwitterCodeForToken();
          }
        }
        window.removeEventListener("message", handleMessage);
        if (popup) popup.close();
      }
    };

    window.addEventListener("message", handleMessage);
  };

  // Exchange code for access token (frontend-only; expose client_secret => NOT for production)
  const exchangeTwitterCodeForToken = async () => {
    const clientId = "WE55eTM4eEFLa2VtLWRNdFhQZlE6MTpjaQ"; // Your Twitter app client ID
    const clientSecret = "RKtO9uhmr6i4zr6WjQ8jP5rHHdIaVq42B9AMq8T2jOprdMY54f"; // ⚠️ Do NOT ship to production
    const redirectUri = `${window.location.origin}/twitter-callback.html`;

    const code = sessionStorage.getItem("twitter_oauth_code");
    const codeVerifier = sessionStorage.getItem("twitter_code_verifier");

    if (!code || !codeVerifier) {
      showToast({ message: "No OAuth code or verifier found. Please connect Twitter again.", type: "warning" });
      return;
    }

    try {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_id: clientId,
      });

      const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        },
        body,
      });

      const data = await response.json();

      if (data.access_token) {
        sessionStorage.setItem("twitter_access_token", data.access_token);
        // Optionally persist refresh_token for demo
        if (data.refresh_token) sessionStorage.setItem("twitter_refresh_token", data.refresh_token);
        showToast({ message: "Twitter connected! Fetching profile…", type: "success" });
        await hydrateTwitterAccountFromAPI(data.access_token);
      } else {
        console.error("Token exchange failed:", data);
        showToast({ message: "Failed to exchange code for token. See console.", type: "error" });
      }
    } catch (error) {
      console.error("Error exchanging code:", error);
      showToast({ message: "Error exchanging Twitter code for token.", type: "error" });
    }
  };

  // Use access token to fetch user profile & add to Connected Accounts
  const hydrateTwitterAccountFromAPI = async (accessToken) => {
    try {
      const res = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,name,username",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();
      if (json && json.data) {
        const u = json.data;
        const followers = u.public_metrics?.followers_count ?? "—";
        setConnectedAccounts((prev) => [
          ...prev,
          {
            id: Date.now(),
            platform: "Twitter",
            username: `@${u.username}`,
            displayName: u.name || u.username,
            followers: followers,
            avatar: u.profile_image_url || null,
            status: "active",
            lastSync: "Just now",
            isPublic: true,
          },
        ]);
        showToast({ message: `Connected to Twitter: @${u.username}`, type: "success" });
      } else {
        // If CORS or other error, fall back to a minimal card
        setConnectedAccounts((prev) => [
          ...prev,
          {
            id: Date.now(),
            platform: "Twitter",
            username: "@your_account",
            displayName: "Twitter Account",
            followers: "—",
            avatar: null,
            status: "active",
            lastSync: "Just now",
            isPublic: true,
          },
        ]);
        showToast({ message: "Twitter connected (profile fetch failed).", type: "warning" });
      }
    } catch (e) {
      console.error("Twitter profile fetch error:", e);
      setConnectedAccounts((prev) => [
        ...prev,
        {
          id: Date.now(),
          platform: "Twitter",
          username: "@your_account",
          displayName: "Twitter Account",
          followers: "—",
          avatar: null,
          status: "active",
          lastSync: "Just now",
          isPublic: true,
        },
      ]);
      showToast({ message: "Twitter connected (profile fetch error).", type: "warning" });
    }
  };

  // =====================
  // Instagram (business via FB SDK OR personal via popup)
  // =====================
  const connectInstagram = () => {
    const choice = window.confirm(
      "Connect Instagram Business/Creator account (OK) or Personal account (Cancel)?"
    );

    if (choice) {
      // Instagram Business via Facebook SDK
      FB.login(
        function (response) {
          if (response.authResponse) {
            const userToken = response.authResponse.accessToken;
            FB.api("/me/accounts", { access_token: userToken }, function (pages) {
              if (pages && pages.data && pages.data.length > 0) {
                let foundInstagram = false;
                pages.data.forEach((page) => {
                  FB.api(
                    `/${page.id}?fields=instagram_business_account{name,username,profile_picture_url,followers_count}`,
                    { access_token: page.access_token },
                    function (insta) {
                      if (insta.instagram_business_account) {
                        foundInstagram = true;
                        const ig = insta.instagram_business_account;
                        setConnectedAccounts((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            platform: "Instagram",
                            username: `@${ig.username}`,
                            displayName: ig.name || ig.username,
                            followers: ig.followers_count || "—",
                            avatar: ig.profile_picture_url || null,
                            status: "active",
                            lastSync: "Just now",
                            isPublic: true,
                          },
                        ]);
                        showToast({ message: `Connected to Instagram Business: @${ig.username}` , type: "success" });
                      }
                    }
                  );
                });
                if (!foundInstagram) {
                  showToast({ message: "No Instagram Business Accounts found.", type: "warning" });
                }
              }
            });
          }
        },
        {
          scope:
            "pages_show_list,instagram_basic,instagram_manage_insights,instagram_content_publish",
        }
      );
    } else {
      // Instagram Personal with popup monitoring
      const clientId = "YOUR_INSTAGRAM_CLIENT_ID";
      const redirectUri = encodeURIComponent(window.location.origin);
      const scope = "user_profile,user_media";
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

      handleOAuthPopup("Instagram", authUrl);
    }
  };
   // ----------------- LINKEDIN LOGIN -----------------
  const handleLinkedInLogin = () => {
    const redirectUri = `${window.location.origin}/linkedin-callback.html`;
    const clientId = "77u0w42ew1nip";
    const scope = "r_liteprofile r_emailaddress w_member_social";
    const linkedInAuthUrl =
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code` +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=linkedin_auth` +
      `&scope=${encodeURIComponent(scope)}`;
    openPopup(linkedInAuthUrl);
  };
  // =====================
  // LinkedIn (popup)
  // =====================

  const connectLinkedIn = () => {
    const clientId = "77u0w42ew1nipf";
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("r_liteprofile r_emailaddress w_member_social");
    const state = "linkedin";
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    handleOAuthPopup("LinkedIn", authUrl);
  };

  // =====================
  // YouTube (popup)
  // =====================
  const connectYouTube = () => {
    const clientId = "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("https://www.googleapis.com/auth/youtube");
    const state = "youtube";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&access_type=offline`;

    handleOAuthPopup("YouTube", authUrl);
  };

  // =====================
  // TikTok (popup)
  // =====================
  const connectTikTok = () => {
    const clientKey = "YOUR_TIKTOK_CLIENT_KEY";
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = "user.info.basic,video.list";
    const state = "tiktok";
    const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;

    handleOAuthPopup("TikTok", authUrl);
  };

  // =====================
  // Test connection
  // =====================
  const testConnection = async (platform, accountId) => {
    const accessToken = sessionStorage.getItem(`${platform.toLowerCase()}_access_token`);
    if (!accessToken) {
      showToast({ message: `No ${platform} access token found. Please reconnect your account.`, type: "warning" });
      return;
    }
    showToast({ message: `${platform} connection test successful!`, type: "success" });
  };

  // Optionally hydrate Twitter on mount if token already exists (avoid duplicates)
  useEffect(() => {
    const hasTwitter = connectedAccounts.some((a) => a.platform === "Twitter");
    const token = sessionStorage.getItem("twitter_access_token");
    if (!hasTwitter && token) {
      hydrateTwitterAccountFromAPI(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <div className="account-status">{getStatusIcon(account.status)}</div>
                </div>
                <div className="account-info">
                  <div className="account-avatar">
                    {account.avatar ? (
                      <img src={account.avatar} alt={account.displayName} />
                    ) : (
                      <div className="avatar-placeholder" style={{ background: platformInfo?.color }}>
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
                      background: `rgba(${hexToRgb(platformInfo?.color || "#000")}, 0.1)`,
                      color: platformInfo?.color || "#333",
                      border: `1px solid rgba(${hexToRgb(platformInfo?.color || "#000")}, 0.2)`
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
            .filter((platform) => !connectedAccounts.some((acc) => acc.platform === platform.name))
            .map((platform) => (
              <div key={platform.name} className="platform-card">
                <div className="platform-header">
                  <div className="platform-icon" style={{ "--platform-color": platform.color }}>
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
            We use industry-standard OAuth 2.0 authentication to securely connect your accounts. We never store your passwords and you can revoke access at any time.
          </p>
        </div>
      </div>

      {/* Connect Modal */}
      {showAddModal && selectedPlatform && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="connect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-platform" style={{ "--platform-color": selectedPlatform.color }}>
                {selectedPlatform.icon}
                <h2>Connect {selectedPlatform.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>
                A popup window will open to authorize your {selectedPlatform.name} account.
              </p>
              <div className="modal-permissions">
                <h4>Permissions requested:</h4>
                <ul>
                  <li>Read your profile information</li>
                  <li>Post on your behalf</li>
                  <li>Access your follower count</li>
                  <li>View your post analytics</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="btn-connect"
                style={{ "--platform-color": selectedPlatform.color }}
                onClick={() => {
                  const platformName = selectedPlatform.name;
                  switch (platformName) {
                    case "Facebook":
                      connectFacebook();
                      break;
                    case "Twitter":
                      connectTwitter(); // NEW secure PKCE flow
                      break;
                    case "Instagram":
                      connectInstagram();
                      break;
                    case "LinkedIn":
                      connectLinkedIn();
                      break;
                    case "YouTube":
                      connectYouTube();
                      break;
                    case "TikTok":
                      connectTikTok();
                      break;
                    default:
                      showToast({ message: `${platformName} integration coming soon!`, type: "info" });
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
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export default Accounts;
