import React from 'react'

const ProductDataField = ({ id = '', label = '', target = false, error = '', content }) => {
  return (
    <div className="product-data__field-container">
      {label ? (
        <label className={`product-data__field-label${target ? ' target' : ''}`} htmlFor={id}>
          {label}
        </label>
      ) : null}
      {content({ id, label })}
      {error ? <div className="product-data__error">{error}</div> : null}
    </div>
  )
}

export default ProductDataField
