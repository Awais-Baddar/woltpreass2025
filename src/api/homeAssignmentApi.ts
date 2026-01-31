import type { VenueDynamicResponse, VenueStaticResponse } from "./types";

const BASE_URL =
  "https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    // error message for UI
    let details = "";
    try {
      const text = await res.text();
      details = text ? ` (${text})` : "";
    } catch {

    }
    throw new Error(
      `Request failed: ${res.status} ${res.statusText}${details}`,
    );
  }

  return (await res.json()) as T;
}

export function getVenueStatic(venueSlug: string) {
  const url = `${BASE_URL}/${encodeURIComponent(venueSlug)}/static`;
  return fetchJson<VenueStaticResponse>(url);
}

export function getVenueDynamic(venueSlug: string) {
  const url = `${BASE_URL}/${encodeURIComponent(venueSlug)}/dynamic`;
  return fetchJson<VenueDynamicResponse>(url);
}
