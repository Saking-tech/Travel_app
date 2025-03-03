import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

// Use the stealth plugin with playwright
chromium.use(stealth());

async function KiwiCa() {
    const browser = await chromium.launch({
        headless: false,
    });


    const page = await browser.newPage();

    let cookiesAccepted = false;
    await page.goto(`https://www.kiwi.com/en/search/results/edmonton-alberta-canada/toronto-ontario-canada/2024-06-01/2024-06-08`);
    await page.waitForTimeout(10000);

    if (!cookiesAccepted) {
        await page.locator('#cookies_accept').click();
        cookiesAccepted = true;
        await page.waitForTimeout(1000);
    }

    await page.locator('text=Cheapest').click();
    await page.waitForTimeout(10000);

    const cheapestFlightCardLocator = await page.locator('[data-test=ResultCardWrapper]').first();
    await page.waitForTimeout(10000);

    const actualPriceWithDollarSign = await cheapestFlightCardLocator.locator('[data-test=ResultCardPrice] > div:nth-child(1)').textContent();
    // console.log(actualPriceWithDollarSign);

    cheapestFlightCardLocator.click();
    await page.waitForTimeout(10000);

    let searchForButtonNotAvailable = false;
    try {
        // Wait for the "Select for" button for up to 3 seconds
        await Promise.race([
            page.waitForSelector('text=Select for', { timeout: 3000 }),
            new Promise(resolve => setTimeout(resolve, 3000))
        ]);

        // If the button is found, click on it
        await page.locator('text=Select for').click();
        await page.waitForTimeout(10000);
    } catch (error) {
        // If the button is not found within 3 seconds, do something else
        console.log("The 'Select for' button was not found within 3 seconds. Trying something else...");
        searchForButtonNotAvailable = true;
        await browser.close();
    }

    // if(searchForButtonNotAvailable){
    //     await page.locator('text=Select for').click();
    //     await page.waitForTimeout(1000);
    // }

    // await page.click('[data-test=MagicLogin-GuestTextLink]');
    // await page.waitForTimeout(10000);

    // Locate the input field by its name attribute and fill it with dummy text
    const inputLocator = page.locator('input[name="firstname"]');
    await inputLocator.fill('John Doe');
    await page.waitForTimeout(10000);

    // Optionally, take a screenshot to verify the input
    await page.screenshot({ path: 'screenshot.png' });
    await page.waitForTimeout(10000);

    // await page.locator('[data-test=ReservationPassenger-names] > input:nth-child(1)').fill('Anubhav');
    // await page.waitForTimeout(1000);

    // await page.locator('[data-test=ReservationPassenger-names] > input:nth-child(2)').fill('Parbhakar');
    // // const inputElements = await passengerNamesElement.getByRole('textbox').first();

    // await passengerNamesElement.getByRole('[role=textbox]').first().fill("Anubhav");
    // // await passengerNamesElement.getByRole('[role=textbox]')[0];

    // const cityCardLocator = page.locator('[data-test=PictureCard]');
    // const cityCardsCount = await cityCardLocator.count();

    // for (let i = 0; i < cityCardsCount; i++) {
    //     const currentCityCardLocator = cityCardLocator.nth(i);
    //     const textContent = await currentCityCardLocator.textContent();
    //     const price = Number(textContent.substring(textContent.indexOf(CURRENCY_SYMBOL) + 1));
    //     if (price < PRICE_THRESHOLD) {
    //         await currentCityCardLocator.click();
    //         await page.waitForTimeout(DEFAULT_TIMEOUT);

    //         await page.locator('text=Cheapest').click();
    //         await page.waitForTimeout(DEFAULT_TIMEOUT);

    //         const city = textContent.substring(textContent.indexOf(DEPARTURE_CITY) + DEPARTURE_CITY.length, textContent.indexOf('From'))
    //             .replaceAll(' ', '-');
    //         const cheapestFlightCardLocator = page.locator('[data-test=ResultCardWrapper]').first();
    //         const actualPriceWithDollarSign = await cheapestFlightCardLocator.locator('[data-test=ResultCardPrice] > div:nth-child(1)').textContent();

    //         const actualPrice = Number(actualPriceWithDollarSign.replace(CURRENCY_SYMBOL, ''));
    //         if (actualPrice < PRICE_THRESHOLD) {
    //             await cheapestFlightCardLocator.screenshot({ path: `${from} ${to}(${city})-${actualPrice}.png` });
    //         }

    //         await page.goto(`https://www.kiwi.com/en/search/tiles/${DEPARTURE_CITY_URL_PARAM}/anywhere/${from}/${to}?sortAggregateBy=price`);
    //         await page.waitForTimeout(DEFAULT_TIMEOUT);
    //     }
    // }

    await browser.close();
    return actualPriceWithDollarSign;
}

export { KiwiCa }

KiwiCa();
