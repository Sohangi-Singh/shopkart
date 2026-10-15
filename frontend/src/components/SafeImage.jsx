import { useState } from "react";

// Image with graceful fallback so a dead URL never shows a broken icon.
// Falls back to a branded gradient SVG with the product initial.
function SafeImage({ src, alt, ...rest }) {
  const [failed, setFailed] = useState(false);

  const fallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><text x="50%" y="54%" font-family="Arial" font-size="72" font-weight="bold" fill="white" text-anchor="middle">${(alt || "S").slice(0, 1).toUpperCase()}</text></svg>`
    );

  return (
    <img
      src={!src || failed ? fallback : src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

export default SafeImage;
