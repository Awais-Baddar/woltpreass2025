import { useState } from "react";
import { FormField } from "../components/FormField";
import { getVenueDynamic, getVenueStatic } from "../api/homeAssignmentApi";
import { haversineDistanceMeters } from "../domain/distance";
import {
  calculateDeliveryFee,
  calculateSmallOrderSurcharge,
  calculateTotalPrice,
  DeliveryNotAvailableError,
  type PriceResult,
} from "../domain/pricing";
import {
  InputParseError,
  parseEuroToCents,
  parseNumberField,
} from "../domain/parse";

function formatEur(cents: number) {
  const value = cents / 100;
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatMeters(m: number) {
  return `${m} m`;
}

type FieldErrors = {
  venueSlug?: string;
  cartValue?: string;
  userLatitude?: string;
  userLongitude?: string;
};

export function DopcPage() {
  const [result, setResult] = useState<PriceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [venueSlug, setVenueSlug] = useState("home-assignment-venue-helsinki");
  const [cartValue, setCartValue] = useState("10");
  const [userLatitude, setUserLatitude] = useState("60.17094");
  const [userLongitude, setUserLongitude] = useState("24.93087");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const r = result ?? {
    cartValue: 0,
    smallOrderSurcharge: 0,
    deliveryFee: 0,
    deliveryDistance: 0,
    totalPrice: 0,
  };

  // const isFormLikelyValid =
  //   venueSlug.trim().length > 0 &&
  //   cartValue.trim().length > 0 &&
  //   userLatitude.trim().length > 0 &&
  //   userLongitude.trim().length > 0;

  function validateInputs() {
    const next: FieldErrors = {};

    if (!venueSlug.trim()) next.venueSlug = "Venue slug is required.";

    try {
      parseEuroToCents(cartValue);
    } catch (e) {
      next.cartValue = e instanceof Error ? e.message : "Invalid cart value.";
    }

    try {
      const lat = parseNumberField(userLatitude, "User latitude");
      if (lat < -90 || lat > 90)
        next.userLatitude = "Latitude must be between -90 and 90.";
    } catch (e) {
      next.userLatitude = e instanceof Error ? e.message : "Invalid latitude.";
    }

    try {
      const lon = parseNumberField(userLongitude, "User longitude");
      if (lon < -180 || lon > 180)
        next.userLongitude = "Longitude must be between -180 and 180.";
    } catch (e) {
      next.userLongitude =
        e instanceof Error ? e.message : "Invalid longitude.";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function onGetLocation() {
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLatitude(String(pos.coords.latitude));
        setUserLongitude(String(pos.coords.longitude));

        // clear only on success
        setFieldErrors((p) => ({
          ...p,
          userLatitude: undefined,
          userLongitude: undefined,
        }));
      },
      (err) => {
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied."
            : "Failed to get location.",
        );
      },
    );
  }

  async function onCalculate() {
    setErrorMsg(null);

    const ok = validateInputs();
    if (!ok) {
      setResult(null);
      return;
    }

    setIsLoading(true);

    try {
      const cartCents = parseEuroToCents(cartValue);
      const lat = parseNumberField(userLatitude, "User latitude");
      const lon = parseNumberField(userLongitude, "User longitude");

      const [s, d] = await Promise.all([
        getVenueStatic(venueSlug),
        getVenueDynamic(venueSlug),
      ]);

      const [venueLon, venueLat] = s.venue_raw.location.coordinates;

      const distanceMeters = haversineDistanceMeters(
        lat,
        lon,
        venueLat,
        venueLon,
      );

      const specs = d.venue_raw.delivery_specs;

      const surcharge = calculateSmallOrderSurcharge(
        cartCents,
        specs.order_minimum_no_surcharge,
      );

      const deliveryFee = calculateDeliveryFee(
        specs.delivery_pricing.base_price,
        specs.delivery_pricing.distance_ranges,
        distanceMeters,
      );

      const total = calculateTotalPrice(cartCents, surcharge, deliveryFee);

      setResult({
        cartValue: cartCents,
        smallOrderSurcharge: surcharge,
        deliveryFee,
        deliveryDistance: distanceMeters,
        totalPrice: total,
      });
    } catch (e) {
      // Friendly venue slug error
      if (e instanceof Error && e.message.includes("404")) {
        setErrorMsg("Venue not found. Check the venue slug.");
      } else if (e instanceof DeliveryNotAvailableError) {
        setErrorMsg(e.message);
      } else if (e instanceof InputParseError) {
        setErrorMsg(e.message);
      } else if (e instanceof Error) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("Something went wrong.");
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="cardHeader">Delivery Order Price Calculator</div>

        <div className="cardBody">
          <div className="sectionTitle">Details</div>

          <div className="formGrid">
            <FormField
              label="Venue slug"
              id="venueSlug"
              testId="venueSlug"
              value={venueSlug}
              onChange={(v) => {
                setVenueSlug(v);
                setFieldErrors((p) => ({ ...p, venueSlug: undefined }));
              }}
              error={fieldErrors.venueSlug}
              placeholder="home-assignment-venue-helsinki"
            />

            <FormField
              label="Cart value (EUR)"
              id="cartValue"
              testId="cartValue"
              value={cartValue}
              onChange={(v) => {
                setCartValue(v);
                setFieldErrors((p) => ({ ...p, cartValue: undefined }));
              }}
              error={fieldErrors.cartValue}
              inputMode="decimal"
              placeholder="10 or 10.55"
            />

            <FormField
              label="User latitude"
              id="userLatitude"
              testId="userLatitude"
              value={userLatitude}
              onChange={(v) => {
                setUserLatitude(v);
                setFieldErrors((p) => ({ ...p, userLatitude: undefined }));
              }}
              error={fieldErrors.userLatitude}
              inputMode="decimal"
              placeholder="60.17094"
            />

            <FormField
              label="User longitude"
              id="userLongitude"
              testId="userLongitude"
              value={userLongitude}
              onChange={(v) => {
                setUserLongitude(v);
                setFieldErrors((p) => ({ ...p, userLongitude: undefined }));
              }}
              error={fieldErrors.userLongitude}
              inputMode="decimal"
              placeholder="24.93087"
            />
          </div>

          <div className="actions">
            <button
              className="button"
              type="button"
              data-test-id="getLocation"
              onClick={onGetLocation}
            >
              Get location
            </button>

            <button
              className="button"
              type="button"
              data-test-id="calculateDeliveryPrice"
              onClick={onCalculate}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? "Calculating..." : "Calculate delivery price"}
            </button>
          </div>

          {errorMsg ? (
            <div className="errorGlobal" role="alert">
              {errorMsg}
            </div>
          ) : null}

          <hr className="hr" />

          <div className="breakdownTitle">Price breakdown</div>

          <dl className="dl">
            <div className="dt">Cart value</div>
            <dd className="dd">
              <span data-test-id="outputCartValue" data-raw-value={r.cartValue}>
                {formatEur(r.cartValue)}
              </span>
            </dd>

            <div className="dt">Delivery fee</div>
            <dd className="dd">
              <span
                data-test-id="outputDeliveryFee"
                data-raw-value={r.deliveryFee}
              >
                {formatEur(r.deliveryFee)}
              </span>
            </dd>

            <div className="dt">Delivery distance</div>
            <dd className="dd">
              <span
                data-test-id="outputDeliveryDistance"
                data-raw-value={r.deliveryDistance}
              >
                {formatMeters(r.deliveryDistance)}
              </span>
            </dd>

            <div className="dt">Small order surcharge</div>
            <dd className="dd">
              <span
                data-test-id="outputSmallOrderSurcharge"
                data-raw-value={r.smallOrderSurcharge}
              >
                {formatEur(r.smallOrderSurcharge)}
              </span>
            </dd>

            <div className="dt">Total price</div>
            <dd className="dd">
              <span
                data-test-id="outputTotalPrice"
                data-raw-value={r.totalPrice}
              >
                {formatEur(r.totalPrice)}
              </span>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
