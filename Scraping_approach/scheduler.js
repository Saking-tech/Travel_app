import { Query } from '../scraping_api/query_objects.js';
import {Worker} from 'node:worker_threads'

/**
 * Used to create a promise that allows for asynchrounous execution of the threads
 * @param {string} fileName 
 * @param {*} mapping 
 * @param {Query} query 
 * @param {Array} prices 
 * @returns 
 */
function createWorker(fileName,mapping,query,prices){
    return new Promise((resolve,reject)=>{
        const worker = new Worker(fileName,{workerData:{
            'mapping':mapping,
            'query':query
        }})

        worker.on('message',(message)=>{
            prices.push(message)
            resolve()
        })

        worker.on('error',(error)=>{
            console.log(error)
            reject(error)
        })
    })
}

/**
 * Internally searches thru all of the available websites and returns the results as a stringified JSON object.
 * @param {Object} mapping 
 * @param {Query} query 
 * @returns 
 */
export async function findFlights(mapping,query){
    const prices = []
    const promises = []
    const functions = [
        { name: 'Travel Japan', fileName: './Scraping_approach/TravelJapan.js' },
        // { name: 'Air Canada', fileName: './Scraping_approach/air_canada.js' },
        // { name: 'Air Asia', fileName: './scraping_approach/air_asia.js'},
        { name: 'Booking.com (SA)', fileName : './Scraping_approach/booking_SA.js'},
        { name: 'Kayak (BRZ)', fileName : './Scraping_approach/Kayak_Brazil.js'},
        { name: 'Ixigo', fileName: './Scraping_approach/ixigo.js'},
        { name: 'Skip Lagged', fileName: './Scraping_approach/skip_lagged.js'}
    ];


    for (const {name, fileName} of functions) {
        promises.push(createWorker(fileName,mapping,query,prices))
    }

    await Promise.all(promises)

    return new Promise((resolve)=>{resolve(prices)})
}
