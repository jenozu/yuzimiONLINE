import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const base=process.env.EDITORIAL_PREVIEW_URL;
if(!base||!base.startsWith("https://"))throw Error("Require safe HTTPS preview URL");
mkdirSync("artifacts/editorial",{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
try {
 for(const view of [
  {name:"desktop",width:1440,height:900},
  {name:"tablet",width:820,height:1180},
  {name:"mobile",width:390,height:844}
 ]) {
  const context=await browser.newContext({viewport:{width:view.width,height:view.height},deviceScaleFactor:1,reducedMotion:"reduce"});
  const page=await context.newPage();
  const response=await page.goto(base,{waitUntil:"domcontentloaded",timeout:45000});
  assert.equal(response?.status(),200,"Homepage should return HTTP 200");
  await page.locator("h1").first().waitFor({timeout:15000});
  await page.locator(".animate-pulse").first().waitFor({state:"hidden",timeout:25000});
  await page.waitForLoadState("networkidle",{timeout:20000});
  await page.locator("img").evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
  assert.match(await page.locator("body").innerText(),/EDITORIAL DESIGN PREVIEW|EDITORIAL PREVIEW/i);
  await page.screenshot({path:"artifacts/editorial/"+view.name+"-home.png",fullPage:true,animations:"disabled"});
  await page.goto(base+"/collections",{waitUntil:"domcontentloaded",timeout:45000});
  await page.locator("h1").first().waitFor();
  await page.locator(".animate-pulse").first().waitFor({state:"hidden",timeout:25000});
  await page.waitForLoadState("networkidle",{timeout:20000});
  await page.locator("img").evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
  const products=await page.locator("a[href^='/product/']").count();
  await page.screenshot({path:"artifacts/editorial/"+view.name+"-collection.png",fullPage:true,animations:"disabled"});
  if(view.name==="mobile"){
    await page.getByRole("button",{name:"Open navigation menu"}).click();
    assert.ok(await page.getByRole("dialog",{name:"Navigation"}).isVisible());
    await page.getByRole("button",{name:"Close menu"}).click();
    await page.getByRole("dialog",{name:"Navigation"}).waitFor({state:"hidden",timeout:15000});
  }
  if(products>0){
    await page.locator("a[href^='/product/']").first().click();
    await page.locator("h1").first().waitFor();
    await page.waitForLoadState("networkidle",{timeout:20000});
    await page.locator("img").evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
    const priceBefore=await page.getByRole("button",{name:/Add to cart/}).textContent();
    await page.getByRole("button",{name:/24 × 36 in/}).click();
    const priceAfter=await page.getByRole("button",{name:/Add to cart/}).textContent();
    assert.ok(priceBefore&&priceAfter);
    await page.screenshot({path:"artifacts/editorial/"+view.name+"-product.png",fullPage:true,animations:"disabled"});
    await page.getByRole("button",{name:/Add to cart/}).click();
    assert.ok(await page.getByRole("dialog",{name:"Shopping bag"}).isVisible());
    await page.screenshot({path:"artifacts/editorial/"+view.name+"-cart.png",fullPage:true,animations:"disabled"});
    await page.getByRole("link",{name:/Continue to checkout/i}).click();
    await page.waitForURL("**/checkout", {timeout:15000});
    await page.getByRole("heading",{name:/THE FINAL/i}).waitFor({timeout:15000});
    assert.match(await page.locator("body").innerText(),/Payments disabled in preview/i);
    await page.screenshot({path:"artifacts/editorial/"+view.name+"-checkout.png",fullPage:true,animations:"disabled"});
    const catalogResponse=await page.request.get(base+"/api/products");
    assert.equal(catalogResponse.status(),200,"Public preview catalog should be accessible");
    const blockedCheckout=await page.request.post(base+"/api/checkout",{data:{}});
    assert.equal(blockedCheckout.status(),403,"Real checkout API must reject writes");
  }
  await context.close();
  console.log(view.name+": homepage, collection, mobile navigation and available product flow checked (products="+products+")");
 }
} catch(error) {
 failures.push(String(error));
 console.error("Browser check failed",error);
 throw error;
} finally {await browser.close()}
