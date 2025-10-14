var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/supabase-client.ts
var supabase_client_exports = {};
__export(supabase_client_exports, {
  SupabaseClient: () => SupabaseClient,
  supabase: () => supabase
});
import fetch from "node-fetch";
var SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, isSupabaseConfigured, headers, SupabaseClient, supabase;
var init_supabase_client = __esm({
  "server/supabase-client.ts"() {
    "use strict";
    SUPABASE_URL = process.env.SUPABASE_URL;
    SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    isSupabaseConfigured = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY;
    headers = isSupabaseConfigured ? {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    } : {};
    SupabaseClient = class {
      baseUrl;
      constructor() {
        if (!isSupabaseConfigured) {
          console.warn("\u26A0\uFE0F Supabase not configured - some features may not work");
          this.baseUrl = "";
          return;
        }
        this.baseUrl = `${SUPABASE_URL}/rest/v1`;
        console.log("\u2713 Supabase REST client initialized");
      }
      async query(sql) {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase not configured");
        }
        try {
          const response = await fetch(`${this.baseUrl}/rpc/execute_sql`, {
            method: "POST",
            headers,
            body: JSON.stringify({ sql })
          });
          if (!response.ok) {
            throw new Error(`Supabase query failed: ${response.statusText}`);
          }
          return await response.json();
        } catch (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
      }
      async select(table, columns = "*", where) {
        if (!isSupabaseConfigured) {
          console.warn("Supabase not configured, returning empty array");
          return [];
        }
        try {
          let url = `${this.baseUrl}/${table}?select=${columns}`;
          if (where) {
            const conditions = Object.entries(where).map(([key, value]) => `${key}=eq.${value}`).join("&");
            url += `&${conditions}`;
          }
          const response = await fetch(url, {
            method: "GET",
            headers
          });
          if (!response.ok) {
            throw new Error(`Supabase select failed: ${response.statusText}`);
          }
          const result = await response.json();
          return Array.isArray(result) ? result : [];
        } catch (error) {
          console.error("Supabase select error:", error);
          return [];
        }
      }
      async insert(table, data) {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase not configured");
        }
        try {
          const response = await fetch(`${this.baseUrl}/${table}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            throw new Error(`Supabase insert failed: ${response.statusText}`);
          }
          const result = await response.json();
          return Array.isArray(result) ? result[0] : result;
        } catch (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
      }
      async update(table, data, where) {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase not configured");
        }
        try {
          const conditions = Object.entries(where).map(([key, value]) => `${key}=eq.${value}`).join("&");
          const response = await fetch(`${this.baseUrl}/${table}?${conditions}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            throw new Error(`Supabase update failed: ${response.statusText}`);
          }
          const result = await response.json();
          return Array.isArray(result) ? result[0] : result;
        } catch (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
      }
      async delete(table, where) {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase not configured");
        }
        try {
          const conditions = Object.entries(where).map(([key, value]) => `${key}=eq.${value}`).join("&");
          const response = await fetch(`${this.baseUrl}/${table}?${conditions}`, {
            method: "DELETE",
            headers
          });
          if (!response.ok) {
            throw new Error(`Supabase delete failed: ${response.statusText}`);
          }
        } catch (error) {
          console.error("Supabase delete error:", error);
          throw error;
        }
      }
      async testConnection() {
        if (!isSupabaseConfigured) {
          console.warn("\u26A0\uFE0F Supabase not configured - connection test skipped");
          return false;
        }
        try {
          const response = await fetch(`${this.baseUrl}/movie_links?limit=1`, {
            method: "GET",
            headers
          });
          console.log("\u2713 Supabase REST API connection successful");
          return response.ok;
        } catch (error) {
          console.error("\u274C Supabase connection test failed:", error);
          return false;
        }
      }
    };
    supabase = new SupabaseClient();
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var DatabaseStorage = class {
  supabaseClient;
  constructor() {
    this.initSupabase();
  }
  async initSupabase() {
    const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
    this.supabaseClient = supabase2;
  }
  async getMovieLinks() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.select("movie_links");
  }
  async getMovieLinkByShortId(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.select("movie_links", "*", { short_id: shortId });
    return result[0];
  }
  async createMovieLink(insertMovieLink) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.insert("movie_links", {
      movie_name: insertMovieLink.movieName,
      original_link: insertMovieLink.originalLink,
      short_id: insertMovieLink.shortId,
      ads_enabled: insertMovieLink.adsEnabled ?? true
    });
  }
  async deleteMovieLink(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.delete("movie_links", { id });
  }
  async updateMovieLinkViews(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const current = await this.supabaseClient.select("movie_links", "views", { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update("movie_links", { views: newViews }, { short_id: shortId });
    }
  }
  async updateMovieLinkOriginalUrl(id, originalLink) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.update("movie_links", { original_link: originalLink }, { id });
    if (!result) {
      throw new Error("Movie link not found");
    }
    return result;
  }
  async updateMovieLinkFull(id, originalLink, adsEnabled) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.update("movie_links", {
      original_link: originalLink,
      ads_enabled: adsEnabled
    }, { id });
    if (!result) {
      throw new Error("Movie link not found");
    }
    return result;
  }
  // API Token methods
  async createApiToken(insertToken) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.insert("api_tokens", {
      token_name: insertToken.tokenName,
      token_value: insertToken.tokenValue,
      token_type: insertToken.tokenType ?? "single",
      is_active: insertToken.isActive ?? true
    });
  }
  async getApiTokens() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.select("api_tokens");
  }
  async getApiTokenByValue(tokenValue) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.select("api_tokens", "*", {
      token_value: tokenValue,
      is_active: true
    });
    return result[0];
  }
  async updateTokenLastUsed(tokenValue) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.update(
      "api_tokens",
      { last_used: (/* @__PURE__ */ new Date()).toISOString() },
      { token_value: tokenValue }
    );
  }
  async updateApiTokenStatus(id, isActive) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    try {
      console.log(`Updating API token ${id} to active: ${isActive}`);
      const result = await this.supabaseClient.update(
        "api_tokens",
        { is_active: isActive },
        { id }
      );
      console.log("Update result:", result);
      if (!result) {
        const tokens = await this.supabaseClient.select("api_tokens", "*", { id });
        if (tokens && tokens.length > 0) {
          return tokens[0];
        }
        throw new Error("API token not found after update");
      }
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error("Error updating API token status:", error);
      throw error;
    }
  }
  async getAdminSettings() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    try {
      console.log("Fetching admin settings from Supabase...");
      const result = await this.supabaseClient.select("admin_settings");
      return result && result.length > 0 ? result[0] : void 0;
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      return void 0;
    }
  }
  async updateAdminCredentials(adminId, adminPassword) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.update(
      "admin_settings",
      { admin_id: adminId, admin_password: adminPassword, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 1 }
    );
    if (!result || result.length === 0) {
      throw new Error("Admin settings not found");
    }
    return result[0];
  }
  async deleteApiToken(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.delete("api_tokens", { id });
  }
  async deactivateApiToken(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.update(
      "api_tokens",
      { is_active: false },
      { id }
    );
  }
  // Quality Movie Links methods
  async createQualityMovieLink(insertQualityMovieLink) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.insert("quality_movie_links", {
      movie_name: insertQualityMovieLink.movieName,
      short_id: insertQualityMovieLink.shortId,
      quality_480p: insertQualityMovieLink.quality480p || null,
      quality_720p: insertQualityMovieLink.quality720p || null,
      quality_1080p: insertQualityMovieLink.quality1080p || null,
      ads_enabled: insertQualityMovieLink.adsEnabled ?? true
    });
  }
  async getQualityMovieLinks() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.select("quality_movie_links");
  }
  async getQualityMovieLinkByShortId(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.select("quality_movie_links", "*", { short_id: shortId });
    return result[0];
  }
  async updateQualityMovieLinkViews(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const current = await this.supabaseClient.select("quality_movie_links", "views", { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update("quality_movie_links", { views: newViews }, { short_id: shortId });
    }
  }
  async updateQualityMovieLink(id, updates) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const updateData = {};
    if (updates.movieName !== void 0) updateData.movie_name = updates.movieName;
    if (updates.quality480p !== void 0) updateData.quality_480p = updates.quality480p || null;
    if (updates.quality720p !== void 0) updateData.quality_720p = updates.quality720p || null;
    if (updates.quality1080p !== void 0) updateData.quality_1080p = updates.quality1080p || null;
    if (updates.adsEnabled !== void 0) updateData.ads_enabled = updates.adsEnabled;
    const result = await this.supabaseClient.update("quality_movie_links", updateData, { id });
    if (!result) {
      throw new Error("Quality movie link not found");
    }
    return result;
  }
  async deleteQualityMovieLink(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.delete("quality_movie_links", { id });
  }
  // Ad View Sessions methods (5-minute timer skip functionality)
  async hasSeenAd(ipAddress, shortId, linkType = "single") {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    try {
      await this.cleanupExpiredSessions();
      const sessions = await this.supabaseClient.select("ad_view_sessions", "*", {
        ip_address: ipAddress,
        short_id: shortId,
        link_type: linkType
      });
      console.log(`hasSeenAd check for IP: ${ipAddress}, shortId: ${shortId}, linkType: ${linkType} - Found ${sessions ? sessions.length : 0} sessions`);
      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        const expiresAt = new Date(session.expires_at);
        const now = /* @__PURE__ */ new Date();
        console.log(`Session found - expires: ${expiresAt.toISOString()}, now: ${now.toISOString()}, hasExpired: ${now >= expiresAt}`);
        return now < expiresAt;
      }
      console.log("No active session found for this IP and shortId");
      return false;
    } catch (error) {
      console.error("Error checking hasSeenAd:", error);
      return false;
    }
  }
  async recordAdView(ipAddress, shortId, linkType = "single") {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    try {
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1e3);
      console.log(`Recording ad view for IP: ${ipAddress}, shortId: ${shortId}, linkType: ${linkType}, expires: ${expiresAt.toISOString()}`);
      const existingSessions = await this.supabaseClient.select("ad_view_sessions", "*", {
        ip_address: ipAddress,
        short_id: shortId,
        link_type: linkType
      });
      if (existingSessions && existingSessions.length > 0) {
        console.log(`Updating existing ad view session with ID: ${existingSessions[0].id}`);
        await this.supabaseClient.update("ad_view_sessions", {
          viewed_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        }, { id: existingSessions[0].id });
      } else {
        console.log("Creating new ad view session");
        await this.supabaseClient.insert("ad_view_sessions", {
          ip_address: ipAddress,
          short_id: shortId,
          link_type: linkType,
          viewed_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        });
      }
      console.log("Ad view recorded successfully");
    } catch (error) {
      console.error("Error recording ad view:", error);
      throw error;
    }
  }
  async cleanupExpiredSessions() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const now = /* @__PURE__ */ new Date();
    try {
      const expiredSessions = await this.supabaseClient.select("ad_view_sessions", "id", {});
      if (expiredSessions && expiredSessions.length > 0) {
        for (const session of expiredSessions) {
          const fullSession = await this.supabaseClient.select("ad_view_sessions", "*", { id: session.id });
          if (fullSession && fullSession[0]) {
            const expiresAt = new Date(fullSession[0].expires_at);
            if (now > expiresAt) {
              await this.supabaseClient.delete("ad_view_sessions", { id: session.id });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  }
  // Quality Episodes methods (NEW FEATURE)
  async createQualityEpisode(insertQualityEpisode) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.insert("quality_episodes", {
      series_name: insertQualityEpisode.seriesName,
      short_id: insertQualityEpisode.shortId,
      start_from_episode: insertQualityEpisode.startFromEpisode,
      episodes: insertQualityEpisode.episodes,
      ads_enabled: insertQualityEpisode.adsEnabled ?? true
    });
  }
  async getQualityEpisodes() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.select("quality_episodes");
  }
  async getQualityEpisodeByShortId(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.select("quality_episodes", "*", { short_id: shortId });
    return result[0];
  }
  async updateQualityEpisodeViews(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const current = await this.supabaseClient.select("quality_episodes", "views", { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update("quality_episodes", { views: newViews }, { short_id: shortId });
    }
  }
  async updateQualityEpisode(id, updates) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const updateData = {};
    if (updates.seriesName !== void 0) updateData.series_name = updates.seriesName;
    if (updates.startFromEpisode !== void 0) updateData.start_from_episode = updates.startFromEpisode;
    if (updates.episodes !== void 0) updateData.episodes = updates.episodes;
    if (updates.adsEnabled !== void 0) updateData.ads_enabled = updates.adsEnabled;
    const result = await this.supabaseClient.update("quality_episodes", updateData, { id });
    if (!result) {
      throw new Error("Quality episode not found");
    }
    return result;
  }
  async deleteQualityEpisode(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.delete("quality_episodes", { id });
  }
  // Quality Zip methods (NEW FEATURE)
  async createQualityZip(insertQualityZip) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.insert("quality_zips", {
      movie_name: insertQualityZip.movieName,
      short_id: insertQualityZip.shortId,
      from_episode: insertQualityZip.fromEpisode,
      to_episode: insertQualityZip.toEpisode,
      quality_480p: insertQualityZip.quality480p || null,
      quality_720p: insertQualityZip.quality720p || null,
      quality_1080p: insertQualityZip.quality1080p || null,
      ads_enabled: insertQualityZip.adsEnabled ?? true
    });
  }
  async getQualityZips() {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    return await this.supabaseClient.select("quality_zips");
  }
  async getQualityZipByShortId(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const result = await this.supabaseClient.select("quality_zips", "*", { short_id: shortId });
    return result[0];
  }
  async updateQualityZipViews(shortId) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const current = await this.supabaseClient.select("quality_zips", "views", { short_id: shortId });
    if (current[0]) {
      const newViews = (current[0].views || 0) + 1;
      await this.supabaseClient.update("quality_zips", { views: newViews }, { short_id: shortId });
    }
  }
  async updateQualityZip(id, updates) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    const updateData = {};
    if (updates.movieName !== void 0) updateData.movie_name = updates.movieName;
    if (updates.fromEpisode !== void 0) updateData.from_episode = updates.fromEpisode;
    if (updates.toEpisode !== void 0) updateData.to_episode = updates.toEpisode;
    if (updates.quality480p !== void 0) updateData.quality_480p = updates.quality480p || null;
    if (updates.quality720p !== void 0) updateData.quality_720p = updates.quality720p || null;
    if (updates.quality1080p !== void 0) updateData.quality_1080p = updates.quality1080p || null;
    if (updates.adsEnabled !== void 0) updateData.ads_enabled = updates.adsEnabled;
    const result = await this.supabaseClient.update("quality_zips", updateData, { id });
    if (!result) {
      throw new Error("Quality zip not found");
    }
    return result;
  }
  async deleteQualityZip(id) {
    if (!this.supabaseClient) {
      const { supabase: supabase2 } = await Promise.resolve().then(() => (init_supabase_client(), supabase_client_exports));
      this.supabaseClient = supabase2;
    }
    await this.supabaseClient.delete("quality_zips", { id });
  }
};
var storage = new DatabaseStorage();

// server/shared/schema.ts
import { pgTable, text, bigserial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var movieLinks = pgTable("movie_links", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  movieName: text("movie_name").notNull(),
  originalLink: text("original_link").notNull(),
  shortId: text("short_id").notNull().unique(),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true)
});
var apiTokens = pgTable("api_tokens", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  tokenName: text("token_name").notNull(),
  tokenValue: text("token_value").notNull().unique(),
  tokenType: text("token_type").notNull().default("single"),
  // "single" or "quality"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsed: timestamp("last_used", { withTimezone: true })
});
var qualityMovieLinks = pgTable("quality_movie_links", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  movieName: text("movie_name").notNull(),
  shortId: text("short_id").notNull().unique(),
  quality480p: text("quality_480p"),
  quality720p: text("quality_720p"),
  quality1080p: text("quality_1080p"),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true)
});
var insertMovieLinkSchema = createInsertSchema(movieLinks).omit({
  id: true,
  views: true,
  dateAdded: true
});
var insertApiTokenSchema = createInsertSchema(apiTokens).omit({
  id: true,
  createdAt: true,
  lastUsed: true
});
var insertQualityMovieLinkSchema = createInsertSchema(qualityMovieLinks).omit({
  id: true,
  views: true,
  dateAdded: true
});
var createShortLinkSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  originalLink: z.string().url("Valid URL is required")
  // Note: adsEnabled is not included for API requests - always true
});
var createQualityShortLinkSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  quality480p: z.string().url("Valid URL is required").optional(),
  quality720p: z.string().url("Valid URL is required").optional(),
  quality1080p: z.string().url("Valid URL is required").optional()
}).refine(
  (data) => data.quality480p || data.quality720p || data.quality1080p,
  {
    message: "At least one quality link is required",
    path: ["quality480p"]
  }
);
var episodeDataSchema = z.object({
  episodeNumber: z.number().min(1),
  quality480p: z.string().url().optional(),
  quality720p: z.string().url().optional(),
  quality1080p: z.string().url().optional()
}).refine(
  (data) => data.quality480p || data.quality720p || data.quality1080p,
  {
    message: "At least one quality link is required for episode",
    path: ["quality480p"]
  }
);
var createQualityEpisodeSchema = z.object({
  seriesName: z.string().min(1, "Series name is required"),
  startFromEpisode: z.number().min(1, "Start episode must be at least 1"),
  episodes: z.array(episodeDataSchema).min(1, "At least one episode is required")
});
var createQualityZipSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  fromEpisode: z.number().min(1, "From episode must be at least 1"),
  toEpisode: z.number().min(1, "To episode must be at least 1"),
  quality480p: z.string().url("Valid URL is required").optional(),
  quality720p: z.string().url("Valid URL is required").optional(),
  quality1080p: z.string().url("Valid URL is required").optional()
}).refine(
  (data) => data.quality480p || data.quality720p || data.quality1080p,
  {
    message: "At least one quality link is required",
    path: ["quality480p"]
  }
).refine(
  (data) => data.fromEpisode <= data.toEpisode,
  {
    message: "From episode must be less than or equal to To episode",
    path: ["fromEpisode"]
  }
);
var adminSettings = pgTable("admin_settings", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  adminId: text("admin_id").notNull().unique(),
  adminPassword: text("admin_password").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
var insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true
});
var adViewSessions = pgTable("ad_view_sessions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ipAddress: text("ip_address").notNull(),
  shortId: text("short_id").notNull(),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
var qualityEpisodes = pgTable("quality_episodes", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  seriesName: text("series_name").notNull(),
  shortId: text("short_id").notNull().unique(),
  startFromEpisode: integer("start_from_episode").notNull().default(1),
  episodes: text("episodes").notNull(),
  // JSON string containing episode data
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true)
});
var qualityZips = pgTable("quality_zips", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  movieName: text("movie_name").notNull(),
  shortId: text("short_id").notNull().unique(),
  fromEpisode: integer("from_episode").notNull(),
  toEpisode: integer("to_episode").notNull(),
  quality480p: text("quality_480p"),
  quality720p: text("quality_720p"),
  quality1080p: text("quality_1080p"),
  views: integer("views").notNull().default(0),
  dateAdded: timestamp("date_added", { withTimezone: true }).notNull().defaultNow(),
  adsEnabled: boolean("ads_enabled").notNull().default(true)
});
var insertAdViewSessionSchema = createInsertSchema(adViewSessions).omit({
  id: true,
  viewedAt: true
});
var insertQualityEpisodeSchema = createInsertSchema(qualityEpisodes).omit({
  id: true,
  views: true,
  dateAdded: true
});
var insertQualityZipSchema = createInsertSchema(qualityZips).omit({
  id: true,
  views: true,
  dateAdded: true
});

// server/routes.ts
import crypto from "crypto";
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    const apiToken = await storage.getApiTokenByValue(token);
    if (!apiToken) {
      return res.status(403).json({ error: "Invalid or inactive token" });
    }
    await storage.updateTokenLastUsed(token);
    req.apiToken = apiToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token verification failed" });
  }
}
function generateShortId() {
  return crypto.randomBytes(3).toString("hex");
}
async function registerRoutes(app2) {
  app2.get("/api/admin-config", async (req, res) => {
    try {
      console.log("Fetching admin config from API endpoint...");
      const adminSettings2 = await storage.getAdminSettings();
      if (!adminSettings2) {
        console.log("No admin settings found");
        return res.status(404).json({
          error: "Admin settings not found in database. Please check Supabase admin_settings table."
        });
      }
      console.log("Admin settings found: [credentials loaded]");
      const response = {
        adminId: adminSettings2.admin_id || adminSettings2.adminId,
        hasCredentials: true
      };
      console.log("Sending response: [credentials sent]");
      res.json(response);
    } catch (error) {
      console.error("Error fetching admin config:", error);
      res.status(500).json({
        error: "Failed to fetch admin configuration from database"
      });
    }
  });
  app2.patch("/api/admin-config", async (req, res) => {
    try {
      const { adminId, adminPassword } = req.body;
      if (!adminId || !adminPassword) {
        return res.status(400).json({ error: "Admin ID and password are required" });
      }
      const updatedSettings = await storage.updateAdminCredentials(adminId, adminPassword);
      res.json({
        adminId: updatedSettings.adminId,
        message: "Admin credentials updated successfully",
        updatedAt: updatedSettings.updatedAt
      });
    } catch (error) {
      console.error("Error updating admin config:", error);
      res.status(500).json({ error: "Failed to update admin configuration" });
    }
  });
  app2.post("/api/admin-login", async (req, res) => {
    try {
      const { adminId, adminPassword } = req.body;
      if (!adminId || !adminPassword) {
        return res.status(400).json({ error: "Admin ID and password are required" });
      }
      const adminSettings2 = await storage.getAdminSettings();
      console.log("Admin settings retrieved:", adminSettings2 ? "Found" : "Not found");
      if (!adminSettings2) {
        return res.status(401).json({ error: "Authentication failed" });
      }
      const storedAdminId = adminSettings2.admin_id || adminSettings2.adminId;
      const storedPassword = adminSettings2.admin_password || adminSettings2.adminPassword;
      console.log("Comparing credentials - Input ID:", adminId, "Stored ID:", storedAdminId ? "exists" : "missing");
      console.log("Password check - Input:", adminPassword ? "provided" : "missing", "Stored:", storedPassword ? "exists" : "missing");
      if (adminId === storedAdminId && adminPassword === storedPassword) {
        res.json({
          success: true,
          message: "Authentication successful",
          adminId: storedAdminId
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ error: "Authentication error" });
    }
  });
  app2.post("/api/create-short-link", authenticateToken, async (req, res) => {
    try {
      const apiToken = req.apiToken;
      if (apiToken.tokenType !== "single") {
        return res.status(403).json({ error: "This token is not authorized for single link creation" });
      }
      const result = createShortLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid data",
          details: result.error.issues
        });
      }
      const { movieName, originalLink } = result.data;
      let shortId;
      let attempts = 0;
      do {
        shortId = generateShortId();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ error: "Failed to generate unique short ID" });
        }
      } while (await storage.getMovieLinkByShortId(shortId));
      const movieLink = await storage.createMovieLink({
        movieName,
        originalLink,
        shortId,
        adsEnabled: true
        // Always true for API created links
      });
      const shortUrl = `${req.protocol}://${req.get("host")}/m/${shortId}`;
      res.status(201).json({
        success: true,
        shortUrl,
        shortId: movieLink.shortId,
        movieName: movieLink.movieName,
        originalLink: movieLink.originalLink,
        adsEnabled: movieLink.adsEnabled
      });
    } catch (error) {
      console.error("Error creating short link:", error);
      res.status(500).json({ error: "Failed to create short link" });
    }
  });
  app2.post("/api/create-quality-short-link", authenticateToken, async (req, res) => {
    try {
      const apiToken = req.apiToken;
      if (apiToken.tokenType !== "quality") {
        return res.status(403).json({ error: "This token is not authorized for quality link creation" });
      }
      const result = createQualityShortLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid data",
          details: result.error.issues
        });
      }
      const { movieName, quality480p, quality720p, quality1080p } = result.data;
      let shortId;
      let attempts = 0;
      do {
        shortId = generateShortId();
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({ error: "Failed to generate unique short ID" });
        }
      } while (await storage.getQualityMovieLinkByShortId(shortId) || await storage.getMovieLinkByShortId(shortId));
      const qualityMovieLink = await storage.createQualityMovieLink({
        movieName,
        shortId,
        quality480p: quality480p || null,
        quality720p: quality720p || null,
        quality1080p: quality1080p || null,
        adsEnabled: true
        // Always true for API created links
      });
      const shortUrl = `${req.protocol}://${req.get("host")}/m/${shortId}`;
      res.status(201).json({
        success: true,
        shortUrl,
        shortId: qualityMovieLink.shortId,
        movieName: qualityMovieLink.movieName,
        qualityLinks: {
          quality480p: qualityMovieLink.quality480p,
          quality720p: qualityMovieLink.quality720p,
          quality1080p: qualityMovieLink.quality1080p
        },
        adsEnabled: qualityMovieLink.adsEnabled
      });
    } catch (error) {
      console.error("Error creating quality short link:", error);
      res.status(500).json({ error: "Failed to create quality short link" });
    }
  });
  app2.get("/api/movie-links", async (req, res) => {
    try {
      const links = await storage.getMovieLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movie links" });
    }
  });
  app2.post("/api/movie-links", async (req, res) => {
    try {
      const result = insertMovieLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      const movieLink = await storage.createMovieLink(result.data);
      res.status(201).json(movieLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to create movie link" });
    }
  });
  app2.get("/api/movie-links/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const link = await storage.getMovieLinkByShortId(shortId);
      if (!link) {
        return res.status(404).json({ error: "Movie link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movie link" });
    }
  });
  app2.patch("/api/movie-links/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateMovieLinkViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });
  app2.patch("/api/movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const { originalLink, adsEnabled } = req.body;
      if (!originalLink || typeof originalLink !== "string") {
        return res.status(400).json({ error: "Original link is required" });
      }
      let updatedLink;
      if (adsEnabled !== void 0) {
        updatedLink = await storage.updateMovieLinkFull(id, originalLink, adsEnabled);
      } else {
        updatedLink = await storage.updateMovieLinkOriginalUrl(id, originalLink);
      }
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update movie link" });
    }
  });
  app2.delete("/api/movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await storage.deleteMovieLink(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete movie link" });
    }
  });
  app2.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getApiTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API tokens" });
    }
  });
  app2.post("/api/tokens", async (req, res) => {
    try {
      const { tokenName, tokenType } = req.body;
      if (!tokenName || typeof tokenName !== "string") {
        return res.status(400).json({ error: "Token name is required" });
      }
      if (!tokenType || !["single", "quality"].includes(tokenType)) {
        return res.status(400).json({ error: "Token type must be 'single' or 'quality'" });
      }
      const tokenValue = crypto.randomBytes(32).toString("hex");
      const apiToken = await storage.createApiToken({
        tokenName,
        tokenValue,
        tokenType,
        isActive: true
      });
      res.status(201).json(apiToken);
    } catch (error) {
      console.error("Error creating API token:", error);
      res.status(500).json({ error: "Failed to create API token" });
    }
  });
  app2.patch("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid token ID" });
      }
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive field is required and must be boolean" });
      }
      const updatedToken = await storage.updateApiTokenStatus(id, isActive);
      res.json(updatedToken);
    } catch (error) {
      console.error("Error updating API token:", error);
      res.status(500).json({ error: "Failed to update API token" });
    }
  });
  app2.delete("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid token ID" });
      }
      await storage.deleteApiToken(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting API token:", error);
      res.status(500).json({ error: "Failed to delete token" });
    }
  });
  app2.get("/api/quality-movie-links", async (req, res) => {
    try {
      const links = await storage.getQualityMovieLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality movie links" });
    }
  });
  app2.post("/api/quality-movie-links", async (req, res) => {
    try {
      const result = insertQualityMovieLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      const qualityMovieLink = await storage.createQualityMovieLink(result.data);
      res.status(201).json(qualityMovieLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality movie link" });
    }
  });
  app2.get("/api/quality-movie-links/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const link = await storage.getQualityMovieLinkByShortId(shortId);
      if (!link) {
        return res.status(404).json({ error: "Quality movie link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality movie link" });
    }
  });
  app2.patch("/api/quality-movie-links/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateQualityMovieLinkViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });
  app2.patch("/api/quality-movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updates = req.body;
      const updatedLink = await storage.updateQualityMovieLink(id, updates);
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality movie link" });
    }
  });
  app2.delete("/api/quality-movie-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await storage.deleteQualityMovieLink(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quality movie link" });
    }
  });
  app2.post("/api/create-quality-episode", authenticateToken, async (req, res) => {
    try {
      const apiToken = req.apiToken;
      if (apiToken.tokenType !== "episode") {
        return res.status(403).json({ error: "This token is not authorized for episode creation" });
      }
      const result = createQualityEpisodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid data",
          details: result.error.issues
        });
      }
      const { seriesName, startFromEpisode, episodes } = result.data;
      let shortId;
      let attempts = 0;
      do {
        shortId = generateShortId();
        const existing = await storage.getQualityEpisodeByShortId(shortId);
        if (!existing) break;
        attempts++;
      } while (attempts < 10);
      if (attempts >= 10) {
        return res.status(500).json({ error: "Unable to generate unique short ID" });
      }
      const qualityEpisode = await storage.createQualityEpisode({
        seriesName,
        shortId,
        startFromEpisode,
        episodes: JSON.stringify(episodes),
        adsEnabled: true
        // API-created episodes always have ads enabled
      });
      const shortUrl = `${req.protocol}://${req.get("host")}/e/${shortId}`;
      res.status(201).json({
        shortUrl,
        shortId,
        seriesName,
        startFromEpisode,
        episodeCount: episodes.length
      });
    } catch (error) {
      console.error("Error creating quality episode series:", error);
      res.status(500).json({ error: "Failed to create quality episode series" });
    }
  });
  app2.get("/api/quality-episodes", async (req, res) => {
    try {
      const episodes = await storage.getQualityEpisodes();
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality episodes" });
    }
  });
  app2.post("/api/quality-episodes", async (req, res) => {
    try {
      const result = insertQualityEpisodeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      const qualityEpisode = await storage.createQualityEpisode(result.data);
      res.status(201).json(qualityEpisode);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality episode series" });
    }
  });
  app2.get("/api/quality-episodes/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const episode = await storage.getQualityEpisodeByShortId(shortId);
      if (!episode) {
        return res.status(404).json({ error: "Quality episode series not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality episode series" });
    }
  });
  app2.patch("/api/quality-episodes/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateQualityEpisodeViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });
  app2.patch("/api/quality-episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updates = req.body;
      const updatedEpisode = await storage.updateQualityEpisode(id, updates);
      res.json(updatedEpisode);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality episode series" });
    }
  });
  app2.delete("/api/quality-episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await storage.deleteQualityEpisode(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quality episode series" });
    }
  });
  app2.post("/api/create-quality-zip", authenticateToken, async (req, res) => {
    try {
      const apiToken = req.apiToken;
      if (apiToken.tokenType !== "zip") {
        return res.status(403).json({ error: "This token is not authorized for zip creation" });
      }
      const result = createQualityZipSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid data",
          details: result.error.issues
        });
      }
      const { movieName, fromEpisode, toEpisode, quality480p, quality720p, quality1080p } = result.data;
      let shortId;
      let attempts = 0;
      do {
        shortId = generateShortId();
        const existing = await storage.getQualityZipByShortId(shortId);
        if (!existing) break;
        attempts++;
      } while (attempts < 10);
      if (attempts >= 10) {
        return res.status(500).json({ error: "Unable to generate unique short ID" });
      }
      const qualityZip = await storage.createQualityZip({
        movieName,
        shortId,
        fromEpisode,
        toEpisode,
        quality480p,
        quality720p,
        quality1080p,
        adsEnabled: true
        // API-created zips always have ads enabled
      });
      const shortUrl = `${req.protocol}://${req.get("host")}/z/${shortId}`;
      res.status(201).json({
        shortUrl,
        shortId,
        movieName,
        fromEpisode,
        toEpisode,
        qualityCount: [quality480p, quality720p, quality1080p].filter(Boolean).length
      });
    } catch (error) {
      console.error("Error creating quality zip:", error);
      res.status(500).json({ error: "Failed to create quality zip" });
    }
  });
  app2.get("/api/quality-zips", async (req, res) => {
    try {
      const zips = await storage.getQualityZips();
      res.json(zips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality zips" });
    }
  });
  app2.post("/api/quality-zips", async (req, res) => {
    try {
      const result = insertQualityZipSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error });
      }
      const qualityZip = await storage.createQualityZip(result.data);
      res.status(201).json(qualityZip);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quality zip" });
    }
  });
  app2.get("/api/quality-zips/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const zip = await storage.getQualityZipByShortId(shortId);
      if (!zip) {
        return res.status(404).json({ error: "Quality zip not found" });
      }
      res.json(zip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quality zip" });
    }
  });
  app2.patch("/api/quality-zips/:shortId/views", async (req, res) => {
    try {
      const { shortId } = req.params;
      await storage.updateQualityZipViews(shortId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update views" });
    }
  });
  app2.patch("/api/quality-zips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updates = req.body;
      const updatedZip = await storage.updateQualityZip(id, updates);
      res.json(updatedZip);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quality zip" });
    }
  });
  app2.delete("/api/quality-zips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await storage.deleteQualityZip(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quality zip" });
    }
  });
  const getClientIP = (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || "unknown";
  };
  app2.get("/m/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const clientIP = getClientIP(req);
      let movieLink = await storage.getMovieLinkByShortId(shortId);
      let qualityMovieLink = await storage.getQualityMovieLinkByShortId(shortId);
      let linkType = "single";
      if (!movieLink && qualityMovieLink) {
        linkType = "quality";
      }
      if (!movieLink && !qualityMovieLink) {
        return res.redirect("/redirect?error=expired");
      }
      const link = movieLink || qualityMovieLink;
      if (!link) {
        return res.redirect("/redirect?error=expired");
      }
      const hasSeenAd = await storage.hasSeenAd(clientIP, shortId, linkType);
      const linkData = {
        movieName: link.movie_name || link.movieName,
        shortId: link.short_id || link.shortId,
        adsEnabled: link.ads_enabled || link.adsEnabled,
        linkType,
        skipTimer: hasSeenAd
        // Skip timer if user has seen ad recently
      };
      if (linkType === "quality" && qualityMovieLink) {
        linkData.qualityLinks = {
          quality480p: qualityMovieLink.quality_480p || qualityMovieLink.quality480p,
          quality720p: qualityMovieLink.quality_720p || qualityMovieLink.quality720p,
          quality1080p: qualityMovieLink.quality_1080p || qualityMovieLink.quality1080p
        };
      } else if (movieLink) {
        linkData.originalLink = movieLink.original_link || movieLink.originalLink;
      }
      const encodedLinkData = encodeURIComponent(JSON.stringify(linkData));
      res.redirect(`/redirect?link=${encodedLinkData}`);
    } catch (error) {
      console.error("Error in redirect route:", error);
      res.redirect("/redirect?error=expired");
    }
  });
  app2.get("/e/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const clientIP = getClientIP(req);
      let qualityEpisode = await storage.getQualityEpisodeByShortId(shortId);
      if (!qualityEpisode) {
        return res.redirect("/redirect?error=expired");
      }
      const hasSeenAd = await storage.hasSeenAd(clientIP, shortId, "episode");
      const linkData = {
        seriesName: qualityEpisode.series_name || qualityEpisode.seriesName,
        shortId: qualityEpisode.short_id || qualityEpisode.shortId,
        adsEnabled: qualityEpisode.ads_enabled || qualityEpisode.adsEnabled,
        linkType: "episode",
        skipTimer: hasSeenAd,
        // Skip timer if user has seen ad recently
        startFromEpisode: qualityEpisode.start_from_episode || qualityEpisode.startFromEpisode,
        episodes: JSON.parse(qualityEpisode.episodes || qualityEpisode.episodes)
      };
      const encodedLinkData = encodeURIComponent(JSON.stringify(linkData));
      res.redirect(`/redirect?link=${encodedLinkData}`);
    } catch (error) {
      console.error("Error in episode redirect route:", error);
      res.redirect("/redirect?error=expired");
    }
  });
  app2.post("/api/record-ad-view", async (req, res) => {
    try {
      const { shortId, linkType } = req.body;
      const clientIP = getClientIP(req);
      if (!shortId) {
        return res.status(400).json({ error: "Short ID is required" });
      }
      await storage.recordAdView(clientIP, shortId, linkType || "single");
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording ad view:", error);
      res.status(500).json({ error: "Failed to record ad view" });
    }
  });
  app2.post("/api/cleanup-expired-sessions", async (req, res) => {
    try {
      await storage.cleanupExpiredSessions();
      res.json({ success: true });
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      res.status(500).json({ error: "Failed to cleanup expired sessions" });
    }
  });
  app2.get("/z/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const clientIP = getClientIP(req);
      let qualityZip = await storage.getQualityZipByShortId(shortId);
      if (!qualityZip) {
        return res.redirect("/redirect?error=expired");
      }
      const hasSeenAd = await storage.hasSeenAd(clientIP, shortId, "zip");
      console.log(`IP ${clientIP} accessing zip link ${shortId} - hasSeenAd: ${hasSeenAd}`);
      const linkData = {
        movieName: qualityZip.movie_name || qualityZip.movieName,
        shortId: qualityZip.short_id || qualityZip.shortId,
        adsEnabled: qualityZip.ads_enabled || qualityZip.adsEnabled,
        linkType: "zip",
        skipTimer: hasSeenAd,
        // Skip timer if user has seen ad recently
        fromEpisode: qualityZip.from_episode || qualityZip.fromEpisode,
        toEpisode: qualityZip.to_episode || qualityZip.toEpisode,
        qualityLinks: {
          quality480p: qualityZip.quality_480p || qualityZip.quality480p,
          quality720p: qualityZip.quality_720p || qualityZip.quality720p,
          quality1080p: qualityZip.quality_1080p || qualityZip.quality1080p
        }
      };
      const encodedLinkData = encodeURIComponent(JSON.stringify(linkData));
      res.redirect(`/redirect?link=${encodedLinkData}`);
    } catch (error) {
      console.error("Error in zip redirect route:", error);
      res.redirect("/redirect?error=expired");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "server", "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "client/dist"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
var allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server error:", err);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const shouldServeStatic = process.env.SERVE_STATIC === "true";
    if (shouldServeStatic) {
      serveStatic(app);
      log("Serving static files from client/dist");
    } else {
      log("Static file serving disabled - API only mode");
    }
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
