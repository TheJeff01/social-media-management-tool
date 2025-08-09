// Accounts.jsx - Social Media Account Management
import React, { useState, useEffect } from 'react';
import './Accounts.css';
import { 
  FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTiktok,
  FaCheckCircle, FaExclamationTriangle 
} from "react-icons/fa";
import { 
  MdAdd, MdSettings, MdDelete, MdRefresh,
  MdVisibility, MdVisibilityOff 
} from "react-icons/md";
import { IoLinkOutline, IoStatsChart } from "react-icons/io5";
import { BsShieldCheck } from "react-icons/bs";
import { useToast } from "../../components/Toast/ToastProvider";
import { useConfirm } from "../../components/Confirm/ConfirmProvider";

function Accounts() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Load FB SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      FB.init({
        appId: '1269691314882966', // Your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v20.0',
      });
    };
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // Available platforms to connect
  const availablePlatforms = [
    { name: "Twitter", icon: <FaTwitter />, color: "#1DA1F2", description: "Connect your Twitter account to share tweets and engage with your audience" },
    { name: "Facebook", icon: <FaFacebook />, color: "#4267B2", description: "Manage your Facebook pages and personal profile posts" },
    { name: "Instagram", icon: <FaInstagram />, color: "#E4405F", description: "Share photos, stories, and reels to your Instagram account" },
    { name: "LinkedIn", icon: <FaLinkedin />, color: "#0077B5", description: "Professional networking and business content sharing" },
    { name: "YouTube", icon: <FaYoutube />, color: "#FF0000", description: "Upload and manage your YouTube video content" },
    { name: "TikTok", icon: <FaTiktok />, color: "#000000", description: "Create and share short-form video content" }
  ];

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  const handleConnectAccount = (platform) => {
    setSelectedPlatform(platform);
    setShowAddModal(true);
  };

  const handleDisconnectAccount = async (accountId) => {
    const ok = await confirm({
      title: 'Disconnect account',
      message: 'Are you sure you want to disconnect this account?',
      confirmText: 'Disconnect',
      cancelText: 'Cancel',
      tone: 'danger'
    });
    if (ok) {
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      showToast({ message: 'Account disconnected', type: 'success' });
    }
  };

  const handleRefreshAccount = (accountId) => {
    setConnectedAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSync: 'Just now', status: 'active' }
          : acc
      )
    );
  };

  const toggleAccountVisibility = (accountId) => {
    setConnectedAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, isPublic: !acc.isPublic }
          : acc
      )
    );
  };

  const getPlatformInfo = (platformName) => {
    return availablePlatforms.find(p => p.name === platformName);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="status-icon active" />;
      case 'warning':
        return <FaExclamationTriangle className="status-icon warning" />;
      default:
        return <FaCheckCircle className="status-icon active" />;
    }
  };

  // Facebook Connect Logic
  const connectFacebook = () => {
    FB.login(
      function (response) {
        if (response.authResponse) {
          const userToken = response.authResponse.accessToken;

          FB.api("/me/accounts", { access_token: userToken }, function (pages) {
            if (pages && pages.data && pages.data.length > 0) {
              const page = pages.data[0]; // Pick first page for now
              sessionStorage.setItem("fb_page_id", page.id);
              sessionStorage.setItem("fb_page_token", page.access_token);

              setConnectedAccounts(prev => [
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
                  isPublic: true
                }
              ]);

              showToast({ message: `Connected to Facebook Page: ${page.name}` , type: 'success' });
            } else {
              showToast({ message: "No Facebook Pages found for this account.", type: 'warning' });
            }
          });
        } else {
          showToast({ message: "Facebook login cancelled or not authorized.", type: 'warning' });
        }
      },
      { scope: "pages_manage_posts,pages_show_list,pages_read_engagement" }
    );
  };

  return (
    <div className="accounts-container">
      {/* Connected Accounts Section */}
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
                  <div className="account-platform" style={{ '--platform-color': platformInfo?.color }}>
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
                      <div className="avatar-placeholder" style={{ '--platform-color': platformInfo?.color }}>
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
                  <div className="last-sync">
                    Last sync: {account.lastSync}
                  </div>
                  <div className="account-visibility">
                    {account.isPublic ? (
                      <><MdVisibility /> Public</>
                    ) : (
                      <><MdVisibilityOff /> Private</>
                    )}
                  </div>
                </div>

                <div className="account-actions">
                  <button className="action-btn refresh" onClick={() => handleRefreshAccount(account.id)} title="Refresh account data">
                    <MdRefresh />
                  </button>
                  <button className="action-btn visibility" onClick={() => toggleAccountVisibility(account.id)} title={account.isPublic ? "Make private" : "Make public"}>
                    {account.isPublic ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                  <button className="action-btn settings" title="Account settings">
                    <MdSettings />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDisconnectAccount(account.id)} title="Disconnect account">
                    <MdDelete />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Platforms Section */}
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
            .filter(platform => !connectedAccounts.some(acc => acc.platform === platform.name))
            .map((platform) => (
              <div key={platform.name} className="platform-card">
                <div className="platform-header">
                  <div className="platform-icon" style={{ '--platform-color': platform.color }}>
                    {platform.icon}
                  </div>
                  <h3>{platform.name}</h3>
                </div>
                <p className="platform-description">{platform.description}</p>
                <button className="connect-btn" onClick={() => handleConnectAccount(platform)} style={{ '--platform-color': platform.color }}>
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
          <p>We use industry-standard OAuth 2.0 authentication to securely connect your accounts. We never store your passwords and you can revoke access at any time.</p>
        </div>
      </div>

      {/* Connect Account Modal */}
      {showAddModal && selectedPlatform && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="connect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-platform" style={{ '--platform-color': selectedPlatform.color }}>
                {selectedPlatform.icon}
                <h2>Connect {selectedPlatform.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>You'll be redirected to {selectedPlatform.name} to authorize this connection. We'll only access what you explicitly allow.</p>
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
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                className="btn-connect"
                style={{ '--platform-color': selectedPlatform.color }}
                onClick={() => {
                  if (selectedPlatform.name === "Facebook") {
                    connectFacebook();
                  } else {
                    showToast({ message: `Connecting to ${selectedPlatform.name}...`, type: 'info' });
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

export default Accounts;
