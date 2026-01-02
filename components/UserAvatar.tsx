'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import {
  LogOut,
  Settings,
  User,
  Mail,
  UserCheck,
  Shield,

} from "lucide-react";
import "./UserAvatar.css";

const UserAvatar: React.FC = () => {
  const { profile, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="user-avatar loading">...</div>;
  }

  if (!profile) {
    return null;
  }

  const initials = (profile.full_name || profile.username || "U")
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
  };

  const displayName = profile.full_name || profile.username;

  return (
    <div className="user-avatar-container" ref={dropdownRef}>
      <button className="avatar-button-with-name" onClick={toggleDropdown}>
        <div className="avatar-section">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-initials">{initials}</div>
          )}
          {profile.role === "admin" && <div className="admin-indicator">A</div>}
        </div>
        <div className="user-info-section">
          <span className="user-display-name">{displayName}</span>
        </div>
      </button>
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="info-item">
                <UserCheck size={14} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Username</span>
                  <span className="info-value">{profile.username}</span>
                </div>
              </div>
              <div className="info-item">
                <User size={14} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">
                    {profile.full_name || "Not set"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Mail size={14} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">
                    {profile.email || "Not set"}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
          <div className="dropdown-divider"></div>
          {profile.role === "admin" && (
            <>
              <Link href="/admin" className="dropdown-item admin-link">
                <Shield size={16} />
                Admin Dashboard
              </Link>
              <div className="dropdown-divider"></div>
            </>
          )}
          <button
            className="dropdown-item"
            onClick={() => {
              setIsDropdownOpen(false);
              router.push("/settings");
            }}
          >
            <Settings size={16} />
            Settings
          </button>
          <button className="dropdown-item sign-out" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
