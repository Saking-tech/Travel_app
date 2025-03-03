import playwright from 'playwright'
import { Query, Response } from '../scraping_api/query_objects.js'
import { generate_link } from './utility_functions.js'
import {workerData,parentPort} from 'node:worker_threads'

/**
 * Takes in the IP mapping, and query to return a response
 * @param {*} mapping 
 * @param {Query} query 
 * @returns 
 */
export async function book_SA(mapping,query){
    let proxy = `${mapping['af-south-1'][0]}:3128`
    let link = book_SA_Adapter(query)
    let browser = await playwright.chromium.launch({headless:false,
        proxy:{
            server:proxy
        }
    })
    let context = await browser.newContext({
        // userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    })
    let page = await context.newPage()

    let currency = "ZAR"
    let exchange_rate = 1/query.currency_dict[currency]
    
    const sleep = (delay) => new Promise((resolve)=>setTimeout(resolve,delay))

    // locator name, class
    let price_element_locator = 'flight_card_price_main_price'

    await page.goto(link,{waitUntil:'domcontentloaded'})
    // await sleep(10000)

    

    const price = await page.locator(`div[data-testid="${price_element_locator}"]`).first()

    const final_price = parseFloat((await price.innerText()).replace(/[A-Z,]/g,'')) * exchange_rate

    await page.close()
    await context.close()
    await browser.close()
    return new Promise((resolve)=>resolve(parseFloat(final_price.toFixed(2)) * query.num_passengers))
}

/**
 * Adapt the query information into the format that Booking SA expects
 * @param {Query} query 
 */
function book_SA_Adapter(query){
    let base_link = `https://flights.booking.com/flights/${query.origin_airport}.AIRPORT-${query.destination_airport}.AIRPORT/?cabinClass=ECONOMY&sort=CHEAPEST`
    // ONEWAY or ROUNDTRIP
    // query.date is given in YYYY-MM-DD
    let url_info = {
        'adults':query.num_adults,
        'depart':query.departure_date,
        'from':`${query.origin_airport}.AIRPORT`,
        'to':`${query.destination_airport}.AIRPORT`
    }
    if (query.trip_type=="R"){
        url_info['type']='ROUNDTRIP'
        url_info['return']=query.return_date

    }else{
        url_info['type']='ONEWAY'
    }

    // booking.com is stupid, even if you say children=0, it still detects it as 1
    if (query.num_children + query.num_children > 0){
        url_info['children'] = query.num_children + query.num_children
    }else{
        url_info['children'] = ''
    }

    return generate_link(base_link,url_info)
}


const mapping = workerData.mapping
const query = workerData.query
const price = await book_SA(mapping,query)
const response = new Response('Booking.com (SA)',price)
parentPort.postMessage(response.getInformation())