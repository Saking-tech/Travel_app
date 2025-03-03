/**
 * Given a base link, and mappings with key's and values, append to the base link, the key and value in the standard &key=value format.
 * 
 * Returns the changed link.
 * @param {string} link 
 * @param {Object} mappings 
 * @returns {string}
 */
export function generate_link(link,mappings){
    const keys = Object.keys(mappings)

    for(let index = 0;index < keys.length;index++){
        link += `&${keys[index]}=${mappings[keys[index]]}`
    }

    return link
}