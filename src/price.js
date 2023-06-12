/**
     * @param {Number} kop
     * @description express kopiykas as hryvnias with kopiykas
    */
function kopToHrn(kop) {
    return {
        hrn: Number(kop.toString().slice(0, kop.toString().length-2)),
        kop: Number(kop.toString().slice(kop.toString().length-2))
    }
}

/**
 * @param {Number} hrn 
 * @param {Number} kop
 * @description express hryvnias with kopiykas as kopiykas 
*/ 
function hrnToKop(hrn, kop) {
    console.log('hrnToKop - hrn, kop:', hrn, kop)
    return hrn * 100 + kop
}

export {kopToHrn, hrnToKop}