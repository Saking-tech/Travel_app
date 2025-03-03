import playwright from 'playwright'
import { Query,Response } from '../scraping_api/query_objects.js'
import { generate_link } from './utility_functions.js'
import {workerData,parentPort} from 'node:worker_threads'

/**
 * 
 * @param {*} mapping 
 * @param {Query} query 
 * @returns 
 */
export async function book_air_asia(mapping,query){
    let proxy = `${mapping['ap-northeast-1'][0]}:3128`
    let currency = "JPY"
    let browser = await playwright.chromium.launch({headless:false,
        proxy:{
            server:proxy
        },
    })
    let context = await browser.newContext({
        // userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    })
    let page = await context.newPage()
    let link = book_air_asia_Adapter(query)
    let exchange_rate = 1/query.currency_dict[currency]
    const sleep  = (delay) => new Promise((resolve)=>{setTimeout(resolve,delay)})

    
    // this is a class, each name changes, so look for the span tags with classes that start with this name and find the nested p tags inside that
    let price_container_locator = 'Price__PriceContainer-sc-'

    // this is an ID
    let next_button_container_locator = 'jcta-desktop'

    // this is an id to bypass and get to the next page
    let guest_button = "guestButton"

    await page.goto(link)
    await sleep(3000)
    var prices = await page.locator(`span[class^="${price_container_locator}"] p`).nth(1)
    await sleep(3000)
    let final_price = parseInt((await prices.innerText()).replace(',',''))
    let convertedPrice = final_price * exchange_rate


    await page.close()
    await context.close()
    await browser.close()
    return new Promise((resolve)=>{resolve(parseFloat(convertedPrice.toFixed(2)))})
}
/**
 * Takes in the query information and returns the link to be used to for scraping
 * @param {Query} query 
 */
function book_air_asia_Adapter(query){
    let base_link = 'https://www.airasia.com/flights/search/?locale=ja-jp&currency=JPY&airlineProfile=k%2Cg&type=bundled&cabinClass=economy&isOC=false&isDC=false&uce=true&ancillaryAbTest=false&providers=&taIDs='

    // date comes in as YYYY-MM-DD
    let depart_date = query.departure_date.split('-')
    let return_date = null
    let url_info = {
        'origin':query.origin_airport,
        'destination':query.destination_airport,
        'departDate':`${depart_date[2]}/${depart_date[1]}/${depart_date[0]}`,
        'tripType':query.trip_type,
        'adult':query.num_adults,
        'child':query.num_children,
        'infant':query.num_infants
    }
    
    if (query.trip_type == 'R'){
        return_date = query.return_date.split('-')
        url_info['returnDate'] = `${return_date[2]}/${return_date[1]}/${return_date[0]}`
    }

    return generate_link(base_link,url_info)
}

const mapping = workerData.mapping
const query = workerData.query
const price = await book_air_asia(mapping,query)
const response = new Response('Air Asia',price)
parentPort.postMessage(response.getInformation())