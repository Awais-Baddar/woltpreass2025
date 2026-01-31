## Screenshots

### Main UI (Light mode)
![Main UI Light](screenshots/image.png)




# Delivery Order Price Calculator (DOPC)

A React + TypeScript web app that calculates delivery pricing for a venue based on:
- **Cart value**
- **User location (lat/lon)**
- Venue data fetched from the **Home Assignment API** (static + dynamic endpoints)

The UI validates inputs, fetches venue data, calculates distance + fees, and renders a full price breakdown with test-friendly attributes (`data-test-id`, `data-raw-value`).



## Features

- ✅ React + TypeScript implementation
- ✅ Venue data fetched from Home Assignment API
- ✅ Input validation with inline field errors
- ✅ “Get location” using browser geolocation
- ✅ Delivery fee calculation using venue distance ranges
- ✅ Error state for non-deliverable orders (distance too long)
- ✅ Outputs include:
  - Cart value
  - Small order surcharge
  - Delivery fee
  - Delivery distance
  - Total price
- ✅ Testing support:
  - Input elements have required `data-test-id`
  - Output values include `data-raw-value` (money in **cents**, distance in **meters**)
- ✅ Tests written with **Vitest + Testing Library**
- ✅ Light/Dark theme with a hero section

---

## Live behavior (What the app does)

1. User enters:
   - Venue slug (e.g. `home-assignment-venue-helsinki`)
   - Cart value in EUR (e.g. `10` or `10.55`)
   - User latitude / longitude

2. When **Calculate delivery price** is clicked:
   - Inputs are validated and parsed into internal numeric representation
   - App fetches:
     - `/static` venue endpoint for venue coordinates
     - `/dynamic` venue endpoint for pricing specs
   - App computes:
     - Straight-line distance from user → venue (meters)
     - Small order surcharge (cents)
     - Delivery fee based on venue’s distance ranges (cents)
     - Total price (cents)
   - UI renders a breakdown and total

3. If the delivery is not available (e.g. distance exceeds supported range), the app shows an error message.

---

## Pricing logic (Algorithm)

### 1) Small order surcharge
`smallOrderSurcharge = max(0, order_minimum_no_surcharge - cartValue)`

### 2) Delivery distance
Computed as straight-line (Haversine approximation):
`distanceMeters = haversine(userLat, userLon, venueLat, venueLon)`

### 3) Delivery fee
From `/dynamic`:
- `base_price`
- `distance_ranges[]` objects:

Each range includes:
- `min`, `max` (meters)
- `a` (constant cents)
- `b` (distance multiplier)

For a matching range:
`deliveryFee = base_price + a + round(b * distanceMeters / 10)`

If a range has `"max": 0`, delivery is not available for distances `>= min`.

### 4) Total
`totalPrice = cartValue + smallOrderSurcharge + deliveryFee`

All monetary values are handled in **cents**.

---

## Tech stack

- React
- TypeScript
- Vite
- Vitest + Testing Library

---



