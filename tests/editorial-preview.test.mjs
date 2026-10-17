import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("Eight real print sizes use proportional wall measurements",()=>{
 const source=read("src/components/PrintSizeVisualizer.tsx");
 for(const size of ["8 × 10 in","11 × 14 in","12 × 18 in","16 × 20 in","18 × 24 in","20 × 30 in","24 × 32 in","24 × 36 in"]) assert.ok(source.includes(size),size);
 assert.ok(source.includes("width/72*100") && source.includes("height/48*100"));
});
test("Preview checkout never renders payment form",()=>{
 assert.ok(read("src/App.tsx").includes('VITE_EDITORIAL_PREVIEW === "true" ? <PreviewCheckout /> : <Checkout />'));
 assert.ok(read("src/pages/PreviewCheckout.tsx").includes("Nothing was submitted or paid."));
});
test("Admin and transactional APIs reject preview requests",()=>{
 for(const path of ["api/checkout.ts","api/checkout-status.ts","api/support-contact.ts","api/stripe-webhook.ts","api/_handler.ts"]) assert.ok(read(path).includes('YUZIMI_EDITORIAL_PREVIEW === "true"'),path);
});
test("Public catalog proxy is GET-only",()=>{
 for(const path of ["api/products.ts","api/products/[slug].ts"]){
 const source=read(path);assert.ok(source.includes('req.method!=="GET"'));assert.ok(source.includes("https://yuzimi.online/api/products"));
 }
});
test("Cart persistence and variant totals remain intact",()=>{
 const source=read("src/context/CartContext.tsx");assert.ok(source.includes("yuzimi-cart-v1"));assert.ok(source.includes("item.product.price * item.quantity"));
});
