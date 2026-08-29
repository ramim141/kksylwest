import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getBrandingSettings,
  saveBrandingSettings,
  DEFAULT_BRANDING_SETTINGS,
} from "../services/firestore";
import kkmLogoDefault from "../assets/images/KKM LOGO.png";
import roundLogoDefault from "../assets/images/logo3.png";

const BrandingContext = createContext(null);

export const BrandingProvider = ({ children }) => {
  const [brandingSettings, setBrandingSettings] = useState(DEFAULT_BRANDING_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getBrandingSettings();
      if (data) {
        setBrandingSettings(data);
      }
    } catch (err) {
      console.warn("BrandingProvider load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Resolves the assigned logo URL for a specific placement key:
   * 'admitCard' | 'resultCard' | 'certificate' | 'navbar' | 'footer'
   */
  const getLogoFor = (placementKey) => {
    const assigned = brandingSettings?.placements?.[placementKey];

    // Default fallback based on placement type
    const fallbackImage =
      placementKey === "admitCard" || placementKey === "resultCard"
        ? kkmLogoDefault
        : roundLogoDefault;

    if (!assigned) return fallbackImage;

    // Check if assigned is a direct URL (starts with http or data: or /)
    if (assigned.startsWith("http://") || assigned.startsWith("https://") || assigned.startsWith("data:")) {
      return assigned;
    }

    // Match by logo ID in the library
    const matched = brandingSettings?.logos?.find((l) => l.id === assigned);
    if (matched && matched.url && matched.url.trim() !== "") {
      return matched.url;
    }

    // If assigned to built-in default logo ids
    if (assigned === "kkm_main_title") return kkmLogoDefault;
    if (assigned === "kkm_round_crest") return roundLogoDefault;

    return fallbackImage;
  };

  const updateBranding = async (newSettings) => {
    const saved = await saveBrandingSettings(newSettings);
    setBrandingSettings(saved);
    return saved;
  };

  return (
    <BrandingContext.Provider
      value={{
        brandingSettings,
        loading,
        getLogoFor,
        refreshBranding: loadSettings,
        updateBranding,
        defaults: {
          kkmTitleLogo: kkmLogoDefault,
          roundCrestLogo: roundLogoDefault,
        },
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      brandingSettings: DEFAULT_BRANDING_SETTINGS,
      loading: false,
      getLogoFor: (key) =>
        key === "admitCard" || key === "resultCard" ? kkmLogoDefault : roundLogoDefault,
      refreshBranding: () => {},
      updateBranding: async () => {},
      defaults: {
        kkmTitleLogo: kkmLogoDefault,
        roundCrestLogo: roundLogoDefault,
      },
    };
  }
  return context;
};

export default BrandingContext;
