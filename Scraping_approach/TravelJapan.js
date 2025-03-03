import playwright from 'playwright';
import { Query, Response } from '../scraping_api/query_objects.js';
import { generate_link } from './utility_functions.js';
import {workerData,parentPort} from 'node:worker_threads'


/**
 * Recieve IP address mappings and search query, and return the cheapest price for this site.
 * @param {Object} mapping 
 * @param {Query} query 
 * @returns 
 */
async function travelJapan(mapping,query){
  let proxy = `${mapping['ap-northeast-3'][0]}:3128`
  // Launch a new browser instance
  const browser = await playwright.chromium.launch({
  headless: false,
  proxy:{
    server:proxy
  }
  }); // headless: false for seeing the browser action
  const context = await browser.newContext({
    // userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  })

  let currency = "JPY"
  let exchange_rate = 1 / query.currency_dict[currency]
  const page = await context.newPage();

  let link = travelJapan_Adapter(query)
  // Navigate to the target web page
  await page.goto(link);

  // Wait for the element to be visible (optional but recommended)
  const firstResultItem = await page.locator('.result_item').first();

  // Find the nested <p> element within the first result item
  const nestedPElement = await firstResultItem.locator('p.result_item_more_price').first();

  // Get the text content of the <span> element within the nested <p> element
  const priceText = await nestedPElement.locator('span.arial-font').innerText();

  let price = parseFloat(priceText.replace(",",""));
  price *= exchange_rate
  price = parseFloat(price.toFixed(2));

  await page.close()
  await context.close()
  await browser.close();
  return new Promise((resolve)=>{resolve(price)})

}
export {travelJapan};

/**
 * Gets query information and returns the modified URl with the appended search params.
* @param {Query} query 
 */
function travelJapan_Adapter(query){
  let base_link = 'https://www.travel.co.jp/flights/search/flight_list/?cabinclass=Economy'
  let url_info = {
    'origin_place' : query.origin_airport,
    'origin_type' : 'airport',
    'destination_place' : query.destination_airport,
    'destination_type' : 'airport',
    'outbound_date' : query.departure_date,
    'adults' : query.num_adults,
    'children' : query.num_children,
    'infants' : query.num_infants
  }

  if (query.trip_type == 'R'){
    url_info['journey_type'] = 'return'
    url_info['inbound_date'] = query.return_date
  }else{
    url_info['journey_type'] = 'oneway'
  }

  return generate_link(base_link,url_info)
}

const mapping = workerData.mapping
const query = workerData.query
const price = await travelJapan(mapping,query)
const response = new Response('TravelJapan.jp',price)
parentPort.postMessage(response.getInformation())