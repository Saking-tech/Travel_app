import {Query,Response} from '../scraping_api/query_objects.js'
import playwright from 'playwright'
import { generate_link } from './utility_functions.js'
import {workerData,parentPort} from 'node:worker_threads'

/**
 * Get the cheapest prices from Skip lagged
 * @param {*} mapping 
 * @param {Query} query 
 */
export async function book_skiplagged(mapping,query){
    let proxy = `${mapping['us-east-2']}:3128`
    let browser = await playwright.chromium.launch({headless:false,
        proxy:{
            server:proxy
        }
    })
    let context = await browser.newContext()
    let page = await context.newPage()
    let url = book_skiplagged_Adapter(query)
    const sleep = (delay) =>{return new Promise((resolve)=>{setTimeout(resolve,delay)})}
    let currency = "USD"
    const conversion_rate = 1/query.currency_dict[currency]
    await page.goto(url)
    await sleep(7000)
    const price = await page.locator('div.trip-cost >> css=span').first()
    const final_price = parseFloat((await price.innerText()).replace(/\D/g,''))
    const converted_price = final_price*conversion_rate

    await page.close()
    await context.close()
    await browser.close()
    return new Promise((resolve,reject)=>{resolve(parseFloat(converted_price.toFixed(2)))})
}

/**
 * Adapt the query to skip lagged format
 * @param {Query} query 
 */
function book_skiplagged_Adapter(query){
    let base_url = `https://skiplagged.com/flights/${query.origin_airport}/${query.destination_airport}/${query.departure_date}`

    if (query.trip_type == 'R'){
        base_url += `/${query.return_date}`
    }

    base_url += '?'

    let url_info = {
        'adults' : query.num_adults,
        'children' : query.num_children
    }

    return generate_link(base_url,url_info)

}

const mapping = workerData.mapping
const query = workerData.query
const price = await book_skiplagged(mapping,query)
const response = new Response('Skip Lagged',price)
parentPort.postMessage(response.getInformation())
