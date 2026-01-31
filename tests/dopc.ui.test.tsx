import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";

describe("DOPC UI", () => {
  it("calculates and renders correct raw values", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByTestId("venueSlug"));
    await user.type(
      screen.getByTestId("venueSlug"),
      "home-assignment-venue-helsinki",
    );

    await user.clear(screen.getByTestId("cartValue"));
    await user.type(screen.getByTestId("cartValue"), "10");

    //  venue coords -> distance ~0
    await user.clear(screen.getByTestId("userLatitude"));
    await user.type(screen.getByTestId("userLatitude"), "60.17094");

    await user.clear(screen.getByTestId("userLongitude"));
    await user.type(screen.getByTestId("userLongitude"), "24.93087");

    await user.click(screen.getByTestId("calculateDeliveryPrice"));

    expect(await screen.findByTestId("outputCartValue")).toHaveAttribute(
      "data-raw-value",
      "1000",
    );
    expect(screen.getByTestId("outputSmallOrderSurcharge")).toHaveAttribute(
      "data-raw-value",
      "0",
    );
    expect(screen.getByTestId("outputDeliveryFee")).toHaveAttribute(
      "data-raw-value",
      "190",
    );
    expect(screen.getByTestId("outputTotalPrice")).toHaveAttribute(
      "data-raw-value",
      "1190",
    );

    const distRaw = Number(
      screen
        .getByTestId("outputDeliveryDistance")
        .getAttribute("data-raw-value"),
    );
    expect(distRaw).toBeGreaterThanOrEqual(0);
    expect(distRaw).toBeLessThanOrEqual(5);
  });

  it("shows error when delivery is not available (distance >= 1000m)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByTestId("venueSlug"));
    await user.type(
      screen.getByTestId("venueSlug"),
      "home-assignment-venue-helsinki",
    );

    await user.clear(screen.getByTestId("cartValue"));
    await user.type(screen.getByTestId("cartValue"), "10");

    // far coords -> should trigger DeliveryNotAvailableError
    await user.clear(screen.getByTestId("userLatitude"));
    await user.type(screen.getByTestId("userLatitude"), "65.0121");

    await user.clear(screen.getByTestId("userLongitude"));
    await user.type(screen.getByTestId("userLongitude"), "25.4651");
    expect(screen.getByTestId("calculateDeliveryPrice")).not.toBeDisabled();

    await user.click(screen.getByTestId("calculateDeliveryPrice"));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent?.toLowerCase()).toContain("not available");
  });

  it("shows validation error when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByTestId("venueSlug"));
    await user.clear(screen.getByTestId("cartValue"));
    await user.clear(screen.getByTestId("userLatitude"));
    await user.clear(screen.getByTestId("userLongitude"));

  
    expect(screen.getByTestId("calculateDeliveryPrice")).not.toBeDisabled();

    await user.click(screen.getByTestId("calculateDeliveryPrice"));

    expect(
      await screen.findByText("Venue slug is required."),
    ).toBeInTheDocument();
  });
});
