import test from "node:test";
import assert from "node:assert/strict";

import {
  createSvgOutputs,
  encodeSvgForDataUri,
  SVG_DATA_URI_PREFIX,
} from "./svgDataUri.js";

const SVG = `<svg viewBox="0 0 24 24"><path fill="#fff" d="M0 0%"/><text>✓</text></svg>`;

test("creates URL-encoded snippets without changing SVG content", () => {
  const doubleQuoted = createSvgOutputs(SVG, "double");

  assert.match(doubleQuoted.raw, /^data:image\/svg\+xml;utf8,%3Csvg/);
  assert.match(doubleQuoted.raw, /viewBox=%220 0 24 24%22/);
  assert.match(doubleQuoted.raw, /fill=%22%23fff%22/);
  assert.match(doubleQuoted.raw, /M0 0%25/);
  assert.match(doubleQuoted.raw, /%3Ctext%3E✓%3C\/text%3E/);
  assert.equal(
    doubleQuoted.css,
    `background-image: url("${doubleQuoted.raw}");`,
  );
  assert.equal(
    doubleQuoted.html,
    `<img src="${doubleQuoted.preview}" alt="">`,
  );

  const singleQuoted = createSvgOutputs(
    `<svg aria-label='sample'><path d='M0 0'/></svg>`,
    "single",
  );
  assert.equal(
    singleQuoted.css,
    `background-image: url('${singleQuoted.raw}');`,
  );
  assert.match(singleQuoted.raw, /aria-label=%27sample%27/);
});

test("preserves entities and literal quotes in SVG text", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><text>It's &amp; "quoted"</text></svg>`;
  const doubleQuoted = createSvgOutputs(svg, "double");
  const singleQuoted = createSvgOutputs(svg, "single");

  assert.match(doubleQuoted.raw, /It's %26amp; %22quoted%22/);
  assert.match(singleQuoted.raw, /It%27s %26amp; "quoted"/);
  assert.equal(
    decodeURIComponent(doubleQuoted.raw.slice(SVG_DATA_URI_PREFIX.length)),
    svg,
  );
  assert.equal(
    decodeURIComponent(singleQuoted.raw.slice(SVG_DATA_URI_PREFIX.length)),
    svg,
  );
  assert.match(doubleQuoted.html, /%26amp;/);
});

test("creates a Unicode-safe Base64 data URI", () => {
  const { base64 } = createSvgOutputs(SVG);
  const decoded = decodeURIComponent(
    Array.from(atob(base64.split(",")[1]), (character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
    ).join(""),
  );

  assert.equal(decoded, SVG);
});

test("returns empty output fields for blank input", () => {
  assert.deepEqual(createSvgOutputs("  \n"), {
    css: "",
    html: "",
    base64: "",
    raw: "",
    preview: "",
  });
  assert.equal(encodeSvgForDataUri("<svg></svg>"), "%3Csvg%3E%3C/svg%3E");
});
