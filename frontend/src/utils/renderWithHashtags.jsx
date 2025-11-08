import React from "react";

export const renderWithHashtags = (text = "") => {
  if (!text) return null;

  const hashtagRegex = /#[\w]+/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "hashtag", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  if (!segments.length) {
    return text;
  }

  return segments.map((segment, index) =>
    segment.type === "hashtag" ? (
      <span key={`hashtag-${index}`} className="text-blue-500 font-medium">
        {segment.value}
      </span>
    ) : (
      <React.Fragment key={`text-${index}`}>{segment.value}</React.Fragment>
    )
  );
};

export default renderWithHashtags;


