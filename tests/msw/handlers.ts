import { http, HttpResponse } from "msw";

const BASE =
  "https://consumer-api.development.dev.woltapi.com/home-assignment-api/v1/venues";

export const handlers = [
  http.get(`${BASE}/:slug/static`, ({ params }) => {
    const slug = String(params.slug);

    if (slug !== "home-assignment-venue-helsinki") {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }

    return HttpResponse.json({
      venue_raw: { location: { coordinates: [24.93087, 60.17094] } }, // lon, lat
    });
  }),

  http.get(`${BASE}/:slug/dynamic`, ({ params }) => {
    const slug = String(params.slug);

    if (slug !== "home-assignment-venue-helsinki") {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }

    return HttpResponse.json({
      venue_raw: {
        delivery_specs: {
          order_minimum_no_surcharge: 1000,
          delivery_pricing: {
            base_price: 190,
            distance_ranges: [
              { min: 0, max: 500, a: 0, b: 0, flag: null },
              { min: 500, max: 1000, a: 100, b: 1, flag: null },
              { min: 1000, max: 0, a: 0, b: 0, flag: null },
            ],
          },
        },
      },
    });
  }),
];
