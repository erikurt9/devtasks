export const SVG_DATA_URI_PREFIX = "data:image/svg+xml;utf8,";

export function encodeSvgForDataUri(svg, quoteStyle = "double") {
  const wrapperQuote = quoteStyle === "single" ? /'/g : /"/g;
  const encodedQuote = quoteStyle === "single" ? "%27" : "%22";

  return svg
    .trim()
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/&/g, "%26")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(wrapperQuote, encodedQuote)
    .replace(/\r?\n|\r/g, " ");
}

export function createSvgOutputs(svg, quoteStyle = "double") {
  if (!svg.trim()) {
    return {
      css: "",
      html: "",
      base64: "",
      raw: "",
      preview: "",
    };
  }

  const quote = quoteStyle === "single" ? "'" : '"';
  const encoded = encodeSvgForDataUri(svg, quoteStyle);
  const htmlEncoded = encodeSvgForDataUri(svg, "double");
  const raw = `${SVG_DATA_URI_PREFIX}${encoded}`;
  const preview = `${SVG_DATA_URI_PREFIX}${htmlEncoded}`;
  const encoder =
    typeof window === "undefined" ? globalThis.btoa : window.btoa.bind(window);
  const base64 = `data:image/svg+xml;base64,${encoder(
    unescape(encodeURIComponent(svg.trim())),
  )}`;

  return {
    css: `background-image: url(${quote}${raw}${quote});`,
    html: `<img src="${preview}" alt="">`,
    base64,
    raw,
    preview,
  };
}
