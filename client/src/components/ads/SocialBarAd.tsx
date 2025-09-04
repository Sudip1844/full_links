import { useEffect } from "react";

export default function SocialBarAd() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//geographicalpaperworkmovie.com/d1/51/e9/d151e99735d093768a3070dce9f461fd.js";
    script.type = "text/javascript";
    script.async = true;
    
    const container = document.getElementById("social-bar-ad-container");
    if (container) {
      container.appendChild(script);
    }
  }, []);

  return (
    <div 
      id="social-bar-ad-container" 
      style={{ 
        textAlign: "center", 
        margin: "20px 0",
        minHeight: "10px" 
      }}
    >
      {/* Social bar ad will load here */}
    </div>
  );
}