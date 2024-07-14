import React from 'react'

const ProductDataWideSection = ({ id = '', label = '', target = false, error = '', content }) => {
  return (
    <div className="layout-col-wide wide-section-container">
      {label ? (
        <div className="wide-section__column-center">
          <label className={`wide-section__label${target ? ' target' : ''}`}>{label}</label>
        </div>
      ) : null}

      {content({ id, label })}

      {error ? (
        <div className="wide-section__column-center">
          <div className="product-data__error">{error}</div>
        </div>
      ) : null}
    </div>
  )
}

export default ProductDataWideSection
