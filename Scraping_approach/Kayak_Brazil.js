import playwright from 'playwright';
import { Query,Response} from '../scraping_api/query_objects.js';
import {workerData,parentPort} from 'node:worker_threads'

/**
 * Return the pricing information given the IP address mappings and the query information
 * @param {*} mapping 
 * @param {Query} query 
 * @returns 
 */
async function kayakBrazil(mapping,query){
  let proxy = `${mapping['sa-east-1'][0]}:3128`
  // Launch a new browser instance
  const browser = await playwright.chromium.launch({
  proxy:{
    server:proxy
  },
  headless: false,
  timeout:0
  }); // headless: false for seeing the browser action
  const context = await browser.newContext({
    // userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
  })
  const page = await context.newPage();
  let link = kayakBrazil_adapter(query)
  let currency = "BRL"
  let exchange_rate = 1/query.currency_dict[currency]

  // locator name for price element
  let price_element_locator = 'div.f8F1-price-text'

  // Navigate to the target web page
  await page.goto(link,{waitUntil:'domcontentloaded'});

  await page.waitForTimeout(5000);

  // Wait for the element to be visible (optional but recommended)
  const price_element = await page.locator(`${price_element_locator}`).first()
  let firstPriceText = await price_element.innerText()

  await page.close()
  await context.close()
  await browser.close();

  let price = parseFloat(firstPriceText.replace(/\D/g,''));
  price *= exchange_rate;
  price = parseFloat(price.toFixed(2)); 
  return new Promise((resolve)=>resolve(price * query.num_passengers))
}
export {kayakBrazil};

/**
 * Return the formatted information
 * @param {Query} query 
 */
function kayakBrazil_adapter(query){
  // TODO: Add student functionality to query response
  let base_url = `https://www.kayak.com.br/flights/${query.origin_airport}-${query.destination_airport}/${query.departure_date}`
  if (query.trip_type=='R'){
    base_url += `/${query.return_date}`
  }

  base_url += `/${query.num_adults}adults`

  if(query.num_children + query.num_infants > 0 ){
    base_url += '/children'
    if (query.num_infants > 0){
      base_url += `-${query.num_infants}L`
    }
    if (query.num_children > 0){
      let index = 0
      while (index < query.num_children){
        base_url += '-17'
        index +=1
      }
    }
  }
  base_url += '?sort=price_a'
  return base_url
}

const mapping = workerData.mapping
const query = workerData.query
const price = await kayakBrazil(mapping,query)
const response = new Response('Kayak.br',price)
parentPort.postMessage(response.getInformation())