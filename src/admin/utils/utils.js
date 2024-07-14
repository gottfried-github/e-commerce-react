export const omit = (o, propsToOmit) => {
  return Object.keys(o).reduce((oOmitted, k) => {
    if (propsToOmit.includes(k)) return oOmitted

    oOmitted[k] = o[k]
    return oOmitted
  }, {})
}
