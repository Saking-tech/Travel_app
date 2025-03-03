import playwright from 'playwright';

async function fluegeGermany(){
    let cookiesAccepted = false;
  // Launch a new browser instance
    const browser = await playwright.chromium.launch({
    headless: false,
    }); // headless: false for seeing the browser action
    const page = await browser.newPage();


  // Navigate to the target web page
  await page.goto('https://www.fluege.de/flight/encodes/sFlightInput/093cece8fe31059eda3b24fb7ebfb2b7');

  await page.waitForTimeout(10000)
//   if (!cookiesAccepted) {
//     await page.locator('text=OK').click();
//     cookiesAccepted = true;
//     await page.waitForTimeout(1000);
//     }
  // Wait for the element to be visible (optional but recommended)
  const priceLocator = await page.locator('strong.price').first();

  // Check if the element exists before extracting text content
  if (await priceLocator.count() > 0) {
    // Extract the complete text content
    let priceText = await priceLocator.evaluate(element => {
      return element.textContent.trim();
    });

    // console.log(priceText);  // Outputs: "350,84 € p.P."
    let price = parseFloat(priceText.substring(0, priceText.indexOf('€') + 1).replace(",","."));
    price *= 1.48
    price = parseFloat(price.toFixed(2));
    await browser.close();
    return price
  } else {
    console.log('Element not found');
    await browser.close();
  }
}
export {fluegeGermany};
fluegeGermany();

