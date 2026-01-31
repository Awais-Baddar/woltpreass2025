export type VenueStaticResponse = {
  venue_raw: {
    location: {
      // [longitude, latitude]
      coordinates: [number, number];
    };
  };
};

export type DistanceRange = {
  min: number;
  max: number; // 0 => delivery not available for distances >= min
  a: number;
  b: number;
  flag: unknown; // ignored
};

export type VenueDynamicResponse = {
  venue_raw: {
    delivery_specs: {
      order_minimum_no_surcharge: number;
      delivery_pricing: {
        base_price: number;
        distance_ranges: DistanceRange[];
      };
    };
  };
};
