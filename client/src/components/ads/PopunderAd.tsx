import { useEffect } from "react";

export default function PopunderAd() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//geographicalpaperworkmovie.com/8c/df/3c/8cdf3cac4d9a70c349676c7d629e53ec.js";
    script.type = "text/javascript";
    script.async = true;
    
    const container = document.getElementById("popunder-ad-container");
    if (container) {
      container.appendChild(script);
    }
  }, []);

  return (
    <div 
      id="popunder-ad-container" 
      style={{ 
        textAlign: "center", 
        margin: "20px 0",
        minHeight: "10px" 
      }}
    >
      {/* Popunder ad will load here */}
    </div>
  );
}