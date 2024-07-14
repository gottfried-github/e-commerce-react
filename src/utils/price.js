/**
 * @param {Number} kop
 * @description express kopiykas as hryvnias with kopiykas
 */
function kopToHrn(kop) {
  const hrnStr = kop.toString().slice(0, kop.toString().length - 2)

  return {
    hrn: hrnStr ? parseInt(hrnStr, 10) : 0,
    kop: parseInt(kop.toString().slice(kop.toString().length - 2), 10),
  }
}

function kopToHrnStr(kop) {
  const kopStr = kop.toString().slice(kop.toString().length - 2)

  return {
    hrn: kop.toString().slice(0, kop.toString().length - 2),
    kop: parseInt(kopStr, 10) === 0 ? '' : kopStr,
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

export { kopToHrn, kopToHrnStr, hrnToKop }
