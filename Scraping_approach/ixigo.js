import playwright from 'playwright'
import { Query, Response } from '../scraping_api/query_objects.js'
import { generate_link } from './utility_functions.js'
import {workerData,parentPort} from 'node:worker_threads'

/**
 * Return pricing information from ixigo using the IP address mapping and the query information
 * @param {*} mapping 
 * @param {Query} query 
 * @returns 
 */
export async function book_ixigo(mapping,query){
    let proxy = `${mapping['ap-south-1'][0]}:3128`
    let browser = await playwright.chromium.launch({headless:false,
        proxy:{
        server:proxy
    }
})
    let link = ixigo_Adapter(query)
    // locator for finding all of the prices, data-testid="pricing"
    let price_element_locator = 'pricing'
    let sleep = (delay)=> new Promise((resolve)=>(setTimeout(resolve,delay)))
    let context_1 = await browser.newContext({
        // userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    })
    let page = await context_1.newPage()

    
    let currency = "INR"
    let conversion_rate = 1/query.currency_dict[currency]

    await page.goto(link,{waitUntil:'domcontentloaded'})

    let error = true
    let final_price = 0
    let timeout = 15000
    let time = 0

    while (error && time < timeout){
        try {
            let cheapest_price = await page.locator(`h4[data-testid="${price_element_locator}"]`).first()
            let rupee_price = parseFloat((await cheapest_price.innerText()).replace(/[₹,]/g,''))
            final_price = parseFloat((rupee_price * conversion_rate).toFixed(2))
            error = false
        } catch (error) {
            
        }
        time++
        if( time % 1000 == 0){
            console.log(`${time} miliseconds passed waiting for Ixigo`)
        }
    }

    await page.close()
    await context_1.close()
    await browser.close()
    return new Promise((resolve)=>{resolve(final_price * query.num_passengers)})
}

/**
 * Takes in the query information and format into the search params that ixigo expects and return that url
 * @param {Query} query 
 */
function ixigo_Adapter(query){
    let base_url = 'https://www.ixigo.com/search/result/flight?class=e'
    let depart_date = query.departure_date.split('-')
    let return_date = null

    let url_info = {
        'from':query.origin_airport,
        'to':query.destination_airport,
        'adults':query.num_adults,
        'children':query.num_children,
        'infants':query.num_infants,
        'date':`${depart_date[2]}${depart_date[1]}${depart_date[0]}`
    }

    if (query.trip_type == 'R'){
        return_date = query.return_date.split('-')
        url_info['returnDate'] = `${return_date[2]}${return_date[1]}${return_date[0]}`
    }

    return generate_link(base_url,url_info)
}

const mapping = workerData.mapping
const query = workerData.query
const price = await book_ixigo(mapping,query)
const response = new Response('Ixigo',price)
parentPort.postMessage(response.getInformation())