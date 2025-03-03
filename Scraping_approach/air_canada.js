import playwright from 'playwright';
import { Query, Response } from '../scraping_api/query_objects.js';
import { generate_link } from './utility_functions.js';
import {workerData,parentPort} from 'node:worker_threads'

/**
 * @param {playwright.Page} page 
 */
async function get_final_price(page){
    const final_prices_locator = 'td.grid-column.grid-price'
    let total_price = 0

    // 0 qualifies as False, any other number is true
    let prices_detected = 0
    while (!prices_detected) {
        var final_prices = await page.locator(final_prices_locator).all()
        prices_detected = final_prices.length
    }
    
    for (let index = 0; index < final_prices.length; index++) {
        let temp_price = parseFloat((await final_prices[index].innerText()).replace(/[$,]/g,''))
        total_price += temp_price
    }

    return new Promise((resolve)=>{
        resolve(parseFloat(total_price.toFixed(2)))
    })
}

/**
 * Abstracts the logic behind finding and clicking on the cheapest leg.
 * @param {playwright.Page} page 
 */
async function click_cheapest_leg(page){
    const cabin_price_locator = "cabin-price"
    const outbound_seat_containter_locator = 'fare-container-desktop'
    const outbound_seat_button_locator = 'abc-button'
    var not_loaded = true

    // Keep on trying to find element until they are finally detected
    
    while (not_loaded){
        try{
            const cabin_prices_elements = await page.locator(`.${cabin_price_locator}`).all()
            await cabin_prices_elements[0].innerText({timeout:1000})
            not_loaded = false
        }catch (error){

        }
    }   

    const cabin_prices_elements = await page.locator(`.${cabin_price_locator}`).all()

    // For each leg, the economy comes first, and then the business, so select 0, skip 1, select 2... select 34, skip 35, in terms of index

    // leg_prices : [[leg_price,index of leg].....]
    let leg_prices = []
    for (let index = 0; index < cabin_prices_elements.length; index++) {
        if (index % 2 == 0){
            const price = await cabin_prices_elements[index].innerText()
            leg_prices.push([parseInt(price.replace(/\W/g,''),10),index])
        }
    }


    let min_price = 1000000
    let min_index = -1
    // find the minimum price
    for (let index = 0; index < leg_prices.length;index++){
        if (leg_prices[index][0] < min_price){
            min_price = leg_prices[index][0]
            min_index = leg_prices[index][1]
        }
    }

    let cheapest_outbound = cabin_prices_elements[min_index]
    await cheapest_outbound.click()

    let outbound_seat_type_elements = await page.locator(`.${outbound_seat_containter_locator} .${outbound_seat_button_locator}`).all()
    
    await outbound_seat_type_elements[0].click()

    return new Promise((resolve) =>{
        resolve(min_price)
    })
}

/**
 * Handle the upsell and fare combination pop ups
 * @param {playwright.Page} page 
 * @param {string} container_locator 
 */
async function handle_after_click_leg(page){
    const upsell_container_locator = 'upsell-cards-container'
    const fare_combination_locator = 'upgrade-btn'

    // try the upsell 
    try{
        const button_locator = 'abc-button'
        let clickable_elements = await page.locator(`.${upsell_container_locator} .${button_locator}`).all()
        await clickable_elements[0].click()
    }catch(error){
    }

    try{
        const button_locator = 'abc-button'
        let clickable_elements = await page.locator(`.${fare_combination_locator} .${button_locator}`).all()
        await clickable_elements[0].click()
    }catch(error){
    }
}

/**
 * Retrieves information about pricing from Air Canada based on given information.
 * @param {*} mapping 
 * @param {Query} query 
 */
export async function air_canada(mapping,query) {
    let proxy = `${mapping['ca-west-1'][0]}:3128`
    let currency = "CAD"
    let exchange_rate = 1/query.currency_dict[currency]
    const sleep  = (delay) => new Promise((resolve)=> setTimeout(resolve,delay))
    
    // launches chrome brower instance as headless being false
    // headless being false actually loads more information in the outbound request to page
    // prevents immediate blockage from access to the website
    const engine = playwright.chromium;
    const browser = await engine.launch({
        headless: false,
        proxy:{
            server:proxy
        }
    });

    let link = air_canada_Adapter(query)
    const context = await browser.newContext({
        userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    })
    const page = await context.newPage();
    page.route('**/*.{png,jpg,jpeg}',(route,request)=>{route.abort()})
    await page.goto(link,{waitUntil:"domcontentloaded"});
    
    // click on the cheapest leg
    await click_cheapest_leg(page)
    await handle_after_click_leg(page)

    await sleep(3000)

    await click_cheapest_leg(page)
    await handle_after_click_leg(page)

    await sleep(3000)
    
    let final_price = await get_final_price(page)
    final_price = final_price * exchange_rate
    await page.close()
    await context.close()
    await browser.close()

    return new Promise((resolve)=>{
        resolve(final_price)
    })

}

/**
 * Adapts the query information to the Air Canada specifications
 * @param {Query} query 
 */
function air_canada_Adapter(query){
    let base_link = 'https://www.aircanada.com/booking/ca/en/aco/search?orgType0=A&destType0=A&yth=0&ins=0&isFlexible=false'
    // Date comes in YYYY-MM-DD
    let depart_date = query.departure_date.split('-')
    let return_date = null
    let url_info = {
        'org0':query.origin_airport,
        'dest0':query.destination_airport,
        'adt':query.num_adults,
        'chd':query.num_children,
        'inf':query.num_infants,
        'departureDate0':`${depart_date[2]}/${depart_date[1]}/${depart_date[0]}`
    }
    if (query.trip_type=='R'){
        url_info['tripType']='RoundTrip'
        return_date = query.return_date.split('-')
        url_info['departureDate1'] = `${return_date[2]}/${return_date[1]}/${return_date[0]}`
        url_info['org1'] = query.destination_airport
        url_info['dest1'] = query.origin_airport
        url_info['orgType1']='A'
        url_info['destType1']='A'
    }else{
        url_info['tripType']='OneWay'
    }

    return generate_link(base_link,url_info)
}

const mapping = workerData.mapping
const query = workerData.query
const price = await air_canada(mapping,query)
const response = new Response('Air Canada',price)
parentPort.postMessage(response.getInformation())