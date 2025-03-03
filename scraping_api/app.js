import express from 'express'
import {findFlights} from '../Scraping_approach/scheduler.js'
import { Query } from './query_objects.js'

const app = express()
const PORT = process.env.PORT || 3001
const start_vpn = 'https://abhinav6par.pythonanywhere.com/start'
const get_mapping_link = 'http://127.0.0.1:5000/get_list'
const stop_vpn = "https://abhinav6par.pythonanywhere.com/stop"
const response = await fetch(get_mapping_link,{method:'GET','Accepts':'application/json',})
const response_data = await response.json()
let mapping = response_data['mapping']
console.log(mapping)

if (mapping['us-east-2'] == undefined){
    console.log('Server not started.\n Starting server...')
    // if mapping doesn't return anything, then we need to start the server
    await fetch(start_vpn,{method:'GET','Accepts':'application/json'})
    console.log('Started server...')
    let temp_response = await fetch(get_mapping_link,{method:'GET','Accepts':'application/json',})
    let temp_response_date = await temp_response.json()
    mapping = temp_response_date['mapping']
}

app.use(express.json())

async function getHandle(req,res){
    // let response = await findFlights(mapping)
    res.json({'prices':'response'})
}

async function postHandle(req,res,next){
    let body = req.body
    let destination = ''
    let origin = ''
    let departure_date = ''
    let return_date = null
    let adults = 1
    let children = 0
    let infants = 0
    let trip_type = ''
    let currency = ''

    try{
        destination = body['destination']
        origin = body['origin']
        departure_date = body['depart']
        return_date = body['return']
        if (return_date === undefined){
            return_date = null
        }
        adults = body['adults']
        children = body['children']
        infants = body['infants']
        trip_type = body['trip']
        currency = body['currency']

        if (destination === undefined || origin === undefined || departure_date === undefined || adults === undefined || children=== undefined || infants === undefined ||trip_type === undefined || currency== undefined){
            throw new Error('One or more required fields is missing.')
        }

        const query = new Query(adults,children,infants,origin,destination,trip_type,departure_date,return_date,currency)
        query.updateExchangeRates()
        const response = await findFlights(mapping,query)
        res.status(200).json({'prices':response})
    }catch (error){
        res.status(401).json({'message':'Error processing query','reason':error.message})
    }
}

async function mainHandle(req,res){

    // Make sure that proxy servers are started and then proceed
    console.log(`Listening on Port ${PORT}`)
}

async function stopHandle(req,res) {
    const response = await fetch(stop_vpn,{method:"GET",headers:{'Accepts':'application/json'}})
    res.json(await response.json())
}

app.get('/query',getHandle)
app.post('/query',postHandle)
app.get('/stop',stopHandle)
app.get('/',(req,res)=>{
    res.status(200).json({'message':'This works'})
})

app.listen(PORT,mainHandle)