"use client";

import { useMemo } from "react";

// Icons for different categories
const CategoryIcons = {
  creatief: "🌈",
  sensorisch: "🌈",
  muziek: "♪",
  beweging: "♪",
  buiten: "🌳",
  verhaal: "📚",
  spel: "🎮",
  default: "✨",
};

function getCategoryIcon(categoryText) {
  const lower = categoryText.toLowerCase();
  if (lower.includes("creatief") || lower.includes("sensorisch")) return CategoryIcons.creatief;
  if (lower.includes("muziek") || lower.includes("beweging")) return CategoryIcons.muziek;
  if (lower.includes("buiten")) return CategoryIcons.buiten;
  if (lower.includes("verhaal")) return CategoryIcons.verhaal;
  if (lower.includes("spel")) return CategoryIcons.spel;
  return CategoryIcons.default;
}

function parseResponse(text) {
  if (!text) return null;

  const sections = [];
  
  // First, try to find category headers (e.g., "Creatief & Sensorisch:" or "Muziek & Beweging:")
  const categoryPattern = /(?:^|\n)([A-Z][^:]+):\s*\n/g;
  const categoryMatches = [];
  let match;

  while ((match = categoryPattern.exec(text)) !== null) {
    categoryMatches.push({
      title: match[1].trim(),
      startIndex: match.index,
      endIndex: text.length,
    });
  }

  // Set end indices for categories
  for (let i = 0; i < categoryMatches.length; i++) {
    if (i < categoryMatches.length - 1) {
      categoryMatches[i].endIndex = categoryMatches[i + 1].startIndex;
    }
  }

  // If we found categories, parse them
  if (categoryMatches.length > 0) {
    // Add intro text before first category
    const introText = text.substring(0, categoryMatches[0].startIndex).trim();
    if (introText) {
      sections.push({
        type: "text",
        content: introText,
      });
    }

    // Parse each category
    categoryMatches.forEach((cat) => {
      const categoryContent = text.substring(cat.startIndex + cat.title.length + 1, cat.endIndex).trim();
      const items = parseBulletPoints(categoryContent);
      sections.push({
        type: "category",
        title: cat.title,
        icon: getCategoryIcon(cat.title),
        items: items,
      });
    });

    // Add outro text after last category
    const outroText = text.substring(categoryMatches[categoryMatches.length - 1].endIndex).trim();
    if (outroText) {
      sections.push({
        type: "text",
        content: outroText,
      });
    }
  } else {
    // No categories found, try to parse as simple bullet list
    const items = parseBulletPoints(text);
    if (items.length > 0) {
      // Find intro text (everything before first bullet)
      const firstBulletIndex = text.search(/[-•*]\s/);
      if (firstBulletIndex > 0) {
        const introText = text.substring(0, firstBulletIndex).trim();
        if (introText) {
          sections.push({
            type: "text",
            content: introText,
          });
        }
      }

      // Add bullet list
      sections.push({
        type: "list",
        items: items,
      });

      // Find outro text (everything after last bullet)
      const bulletMatches = [...text.matchAll(/[-•*]\s[^\n]+/g)];
      if (bulletMatches.length > 0) {
        const lastMatch = bulletMatches[bulletMatches.length - 1];
        const lastBulletEnd = lastMatch.index + lastMatch[0].length;
        if (lastBulletEnd < text.length) {
          const outroText = text.substring(lastBulletEnd).trim();
          if (outroText) {
            sections.push({
              type: "text",
              content: outroText,
            });
          }
        }
      }
    } else {
      // Just plain text
      sections.push({
        type: "text",
        content: text,
      });
    }
  }

  return sections;
}

function parseBulletPoints(text) {
  const items = [];
  // Match bullet points: - item, • item, * item
  // Handle multi-line items (text that continues on next line without a bullet)
  const lines = text.split('\n');
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line starts with a bullet
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      // Save previous item if exists
      if (currentItem) {
        items.push(currentItem);
      }
      // Start new item
      currentItem = bulletMatch[1];
    } else if (currentItem && line) {
      // Continue current item (multi-line bullet point)
      currentItem += ' ' + line;
    } else if (currentItem && !line) {
      // Empty line might indicate end of item, but continue anyway
      // (some items might have intentional line breaks)
    }
  }

  // Don't forget the last item
  if (currentItem) {
    items.push(currentItem);
  }

  // If no bullet points found, try numbered lists
  if (items.length === 0) {
    const numberedPattern = /(?:^|\n)\d+\.\s+([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/g;
    let match;
    while ((match = numberedPattern.exec(text)) !== null) {
      const itemText = match[1].trim();
      if (itemText) {
        items.push(itemText);
      }
    }
  }

  return items;
}

export default function FormattedResponse({ content }) {
  const sections = useMemo(() => parseResponse(content), [content]);

  if (!sections || sections.length === 0) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        if (section.type === "text") {
          return (
            <p key={index} className="text-[16px] leading-relaxed">
              {section.content}
            </p>
          );
        }

        if (section.type === "category") {
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{section.icon}</span>
                <h3 className="font-semibold text-[16px] text-[#1E1E1E] leading-tight">
                  {section.title}
                </h3>
              </div>
              {section.items.length > 0 ? (
                <ul className="space-y-2.5 ml-7 list-none">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-[16px] leading-relaxed text-[#1E1E1E] relative pl-4">
                      <span className="absolute left-0 top-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[16px] leading-relaxed ml-7 text-[#1E1E1E]">{section.content}</p>
              )}
            </div>
          );
        }

        if (section.type === "list") {
          return (
            <ul key={index} className="space-y-2.5 ml-4 list-none">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-[16px] leading-relaxed text-[#1E1E1E] relative pl-4">
                  <span className="absolute left-0 top-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}

