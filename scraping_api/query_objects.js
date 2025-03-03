import {airports} from '@nwpr/airport-codes'
import dotenv from 'dotenv'


/**
 * Class to be used for instantiating Query object to be passed into methods to maintain integrity within responses.
 */
export class Query{

    // used to confirm whether the inputted currency is in correct format
    // Additionally, updated later to reflect current exchange rates using the exchange rate API
    currency_dict = {
        "USD":1,
        "AED":3.6725,
        "AFN":69.4762,
        "ALL":89.5953,
        "AMD":387.2631,
        "ANG":1.7900,
        "AOA":939.7286,
        "ARS":962.0800,
        "AUD":1.4826,
        "AWG":1.7900,
        "AZN":1.7004,
        "BAM":1.7589,
        "BBD":2.0000,
        "BDT":119.5104,
        "BGN":1.7588,
        "BHD":0.3760,
        "BIF":2903.0652,
        "BMD":1.0000,
        "BND":1.2957,
        "BOB":6.9214,
        "BRL":5.5453,
        "BSD":1.0000,
        "BTN":83.8880,
        "BWP":13.2754,
        "BYN":3.2656,
        "BZD":2.0000,
        "CAD":1.3582,
        "CDF":2847.3207,
        "CHF":0.8450,
        "CLP":926.0895,
        "CNY":7.0943,
        "COP":4179.9242,
        "CRC":518.5490,
        "CUP":24.0000,
        "CVE":99.1652,
        "CZK":22.5979,
        "DJF":177.7210,
        "DKK":6.7162,
        "DOP":59.9664,
        "DZD":132.2916,
        "EGP":48.4201,
        "ERN":15.0000,
        "ETB":114.0476,
        "EUR":0.8993,
        "FJD":2.2173,
        "FKP":0.7574,
        "FOK":6.7163,
        "GBP":0.7574,
        "GEL":2.6942,
        "GGP":0.7574,
        "GHS":15.9494,
        "GIP":0.7574,
        "GMD":70.6341,
        "GNF":8672.0691,
        "GTQ":7.7344,
        "GYD":209.2322,
        "HKD":7.7940,
        "HNL":24.7895,
        "HRK":6.7760,
        "HTG":131.7917,
        "HUF":354.3612,
        "IDR":15399.9680,
        "ILS":3.7404,
        "IMP":0.7574,
        "INR":83.8880,
        "IQD":1308.4617,
        "IRR":42045.6895,
        "ISK":136.9553,
        "JEP":0.7574,
        "JMD":157.5271,
        "JOD":0.7090,
        "JPY":140.5925,
        "KES":129.1407,
        "KGS":84.4901,
        "KHR":4064.7101,
        "KID":1.4826,
        "KMF":442.4440,
        "KRW":1319.9619,
        "KWD":0.3049,
        "KYD":0.8333,
        "KZT":480.2325,
        "LAK":21944.5038,
        "LBP":89500.0000,
        "LKR":301.5520,
        "LRD":199.8219,
        "LSL":17.6340,
        "LYD":4.7727,
        "MAD":9.7578,
        "MDL":17.4630,
        "MGA":4547.6259,
        "MKD":55.5510,
        "MMK":2100.8051,
        "MNT":3386.5499,
        "MOP":8.0278,
        "MRU":39.7703,
        "MUR":45.8573,
        "MVR":15.4206,
        "MWK":1742.6511,
        "MXN":19.2416,
        "MYR":4.3012,
        "MZN":63.9165,
        "NAD":17.6340,
        "NGN":1642.4030,
        "NIO":36.7962,
        "NOK":10.5955,
        "NPR":134.2208,
        "NZD":1.6150,
        "OMR":0.3845,
        "PAB":1.0000,
        "PEN":3.7805,
        "PGK":3.9360,
        "PHP":55.7880,
        "PKR":278.5429,
        "PLN":3.8452,
        "PYG":7793.0224,
        "QAR":3.6400,
        "RON":4.4696,
        "RSD":105.3091,
        "RUB":90.5641,
        "RWF":1353.5077,
        "SAR":3.7500,
        "SBD":8.3075,
        "SCR":13.4412,
        "SDG":454.0603,
        "SEK":10.1839,
        "SGD":1.2958,
        "SHP":0.7574,
        "SLE":22.5999,
        "SLL":22599.8778,
        "SOS":571.9336,
        "SRD":29.5610,
        "SSP":3243.8157,
        "STN":22.0337,
        "SYP":13139.5457,
        "SZL":17.6340,
        "THB":33.2299,
        "TJS":10.6288,
        "TMT":3.5000,
        "TND":3.0348,
        "TOP":2.3238,
        "TRY":34.0055,
        "TTD":6.7653,
        "TVD":1.4826,
        "TWD":31.8545,
        "TZS":2707.9226,
        "UAH":41.4089,
        "UGX":3715.8807,
        "UYU":41.0445,
        "UZS":12723.3564,
        "VES":36.7751,
        "VND":24545.2948,
        "VUV":117.8666,
        "WST":2.7136,
        "XAF":589.9254,
        "XCD":2.7000,
        "XDR":0.7394,
        "XOF":589.9254,
        "XPF":107.3195,
        "YER":250.2697,
        "ZAR":17.6340,
        "ZMW":26.4618,
        "ZWL":13.9563
       }

    // class variables
    num_adults = 1
    num_children = 0
    num_infants = 0
    origin_airport = ''
    destination_airport = ''
    trip_type = ''
    departure_date = ''
    return_date = null
    num_passengers = 1
    currency = ''
    

    /**
     * 
     * @param {number} num_adults 
     * @param {number} num_children 
     * @param {number} num_infants 
     * @param {string} origin_airport 
     * @param {string} destination_airport 
     * @param {string} trip_type 
     * @param {string} departure_date 
     * @param {string} return_date 
     * @param {string} currency
     */
    constructor(num_adults,num_children,num_infants,origin_airport,destination_airport,trip_type,departure_date,return_date,currency){
        this.num_adults = num_adults
        this.num_children = num_children
        this.num_infants = num_infants
        this.origin_airport = origin_airport
        this.destination_airport = destination_airport
        this.trip_type = trip_type
        this.departure_date = departure_date
        this.return_date = return_date
        this.num_passengers = this.num_adults + this.num_children + this.num_infants
        this.currency = currency

        // check to see if any of the conditions that are required are broken

        // more than one adult
        // num_children can't be negative, num_infants can't be negative, there must be at least one adult for each infant.
        // origin and destination airports have to be valid
        // trip type has to be either 'R' for return or 'O' for one-way
        // departure date must be of type YYYY-MM-DD
        // return date must be not null if trip type if return and also must be of the type YYYY-MM-DD
        let origin_airport_search = airports.find((airport)=> airport.iata === this.origin_airport)
        let destination_airport_search = airports.find((airport)=> airport.iata === this.destination_airport)

        if (this.currency_dict[this.currency] == undefined){
            throw new Error('Invalid currency recieved')
        }

        if (this.num_adults < 1){
            throw new Error('Minimum 1 adult required')
        }
        if (this.num_children < 0 ||  this.num_infants < 0){
            throw new Error('Negative numbers not permitted for children and infants')
        }
        if (this.num_infants > 0 && this.num_adults < this.num_infants){
            throw new Error('Adult to infant ratio must be at least 1:1')
        }
        if (!(this.trip_type == 'R' || this.trip_type == 'O')){
            throw new Error('Trip type must be either O or R')
        }
        if (origin_airport_search === undefined || destination_airport_search === undefined){
            throw new Error('Airports must legal IATA codes.')
        }
        if (this.departure_date.search(/^\d{4}-\d{2}-\d{2}$/g) == -1){
            throw new Error('Date must be in the form of YYYY-MM-DD')
        }
        if (this.trip_type == 'R'){
            if (this.return_date == null){
                throw new Error('Return date not found for a trip specified as returnable.')
            }
            if (this.return_date.search(/^\d{4}-\d{2}-\d{2}$/g) == -1){
                throw new Error('Date must be in the form of YYYY-MM-DD')
            }
        }
    }

    /**
     * Returns the information about the search query
     */
    get information(){
        return ({
            'num_adults' : this.num_adults,
            'num_children' : this.num_children,
            'num_infants' : this.num_infants,
            'origin_airport' : this.origin_airport,
            'destination_airport' : this.destination_airport,
            'trip_type' : this.trip_type,
            'departure_date' : this.departure_date,
            'return_date' : this.return_date
        })
    }

    /**
     * Update the internal dictionary for exchange rates. Do this once so that each site doesn't have to do this, decreasing latency
     * The JSON that is received contains the JPN
     */
    async updateExchangeRates(){
        dotenv.config()
        const api_key = process.env.EX_RATE_API_KEY
        const api_url = `https://v6.exchangerate-api.com/v6/${api_key}/latest/${this.currency}`
        const response = await fetch(api_url)
        const response_body = await response.json()
        this.currency_dict = response_body["conversion_rates"]

        return new Promise((resolve,reject)=>{
            resolve()
        })
    }
}

/**
 * Class used to structure the responses back from the scrapers
 */
export class Response{
    #source_site = ''
    #price = 0
    constructor(source,price){
        this.#source_site = source,
        this.#price = price
    }

    getInformation(){
        return ({
            'source':this.#source_site,
            'price':this.#price
        })
    }
}