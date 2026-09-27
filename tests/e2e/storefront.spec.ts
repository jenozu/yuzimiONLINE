import { expect, test, type Page } from "@playwright/test";

const product = {
  id: "print-1",
  slug: "cherry-signal",
  name: "Cherry Signal",
  description: "A vivid cherry blossom art print.",
  image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'%3E%3Crect width='100%25' height='100%25' fill='%23FFB7C5'/%3E%3C/svg%3E",
  category: "Original Series",
  badge: "Bestseller",
  price: 20,
  variants: [
    { size: "8 × 10 in", price: 20, price_cents: 2000, position: 0, available: false },
    { size: "11 × 14 in", price: 30, price_cents: 3000, position: 1, available: true },
    { size: "12 × 18 in", price: 35, price_cents: 3500, position: 2, available: true },
    { size: "16 × 20 in", price: 45, price_cents: 4500, position: 3, available: true },
    { size: "18 × 24 in", price: 55, price_cents: 5500, position: 4, available: true },
    { size: "20 × 30 in", price: 65, price_cents: 6500, position: 5, available: true },
    { size: "24 × 32 in", price: 75, price_cents: 7500, position: 6, available: true },
    { size: "24 × 36 in", price: 80, price_cents: 8000, position: 7, available: true },
  ],
};

async function mockCatalog(page: Page) {
  await page.route("**/api/products", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ products: [product] }),
  }));
}

test("search, variant choice, cart edits, and checkout redirect work", async ({ page }) => {
  await mockCatalog(page);
  await page.route("**/api/checkout", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ url: "https://checkout.stripe.com/c/pay/mock" }),
  }));
  await page.route("https://checkout.stripe.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Stripe Checkout Mock</title>" }));

  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: "Cherry Signal" })).toBeVisible();
  await page.getByPlaceholder("FILTER SPECS...").fill("missing");
  await expect(page.getByText("No matching units found")).toBeVisible();
  await page.getByRole("button", { name: "Clear Search" }).click();
  await page.getByRole("link", { name: /Cherry Signal/ }).click();

  await expect(page.getByRole("button", { name: /8 × 10 in.*unavailable/ })).toBeDisabled();
  await page.getByRole("button", { name: /24 × 36 in, 80.00 dollars/ }).click();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByText("Size: 24 × 36 in")).toBeVisible();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByText("$160.00")).toBeVisible();
  await page.getByRole("button", { name: "Checkout", exact: true }).click();
  await expect(page).toHaveURL(/checkout\.stripe\.com/);
});

test("mobile navigation opens and remains keyboard accessible", async ({ page }) => {
  await mockCatalog(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: /Collections/ })).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.getByRole("button", { name: "Open cart" })).toBeVisible();
});
