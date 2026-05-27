const API_URL = "https://api.anthropic.com/v1/messages";

function getKey() {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || "";
}

export async function callClaude({ system, messages, maxTokens = 512 }) {
  const key = getKey();
  if (!key) throw new Error("VITE_ANTHROPIC_API_KEY is not set in .env");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

export function buildMenuContext(data) {
  const items = (data.items || [])
    .map((i) =>
      `- ${i.name} (${i.category}) ₹${i.price}${i.desc ? `: ${i.desc}` : ""}${i.veg != null ? (i.veg ? " [VEG]" : " [NON-VEG]") : ""}${i.spice ? ` [Spice: ${["", "Mild", "Medium", "Hot"][i.spice]}]` : ""}${!i.available ? " [UNAVAILABLE]" : ""}`
    )
    .join("\n");
  return `Restaurant: ${data.name || "Our Restaurant"}\nTagline: ${data.tagline || ""}\n\nMenu:\n${items}`;
}
