import React, { useState, useEffect, useRef } from 'react'

function Filters({ fieldName, dir, inStock, fieldNameChangeCb, dirChangeCb, inStockChangeCb }) {
  const fieldNames = ['time', 'price', 'name']
  fieldNames.splice(fieldNames.indexOf(fieldName), 1)

  return (
    <ul className="filters">
      <li
        className="filter"
        onClick={() => {
          inStockChangeCb(!inStock)
        }}
      >
        <span className="filter__text">{inStock ? 'усі' : 'наявні'}</span>
      </li>

      <li className="filter">
        <SortOrderDropdown
          currentValue={fieldName}
          values={fieldNames}
          currentValueChangeCb={currentValue => {
            fieldNameChangeCb(currentValue)
          }}
        />
      </li>

      <li
        className={`filter arrow${dir === 1 ? ' bottom-up' : ''}`}
        onClick={() => {
          dirChangeCb(dir === 1 ? -1 : 1)
        }}
      ></li>
    </ul>
  )
}

function SortOrderDropdown({ currentValue, values, currentValueChangeCb }) {
  const refHead = useRef()
  const refDropdown = useRef()
  const [maxWidth, setMaxWidth] = useState(false)
  const [dropdownDisplayed, setDropdownDisplayed] = useState(false)

  /* see Dropdown width and positioning in readme */
  useEffect(() => {
    if (!maxWidth) refDropdown.current.classList.add('max-width')

    // make dropdown measurable
    if (!dropdownDisplayed) {
      refDropdown.current.style.visibility = 'hidden'
      refDropdown.current.classList.remove('noned')
    }

    // measure the dropdown and the head
    const dropdownLarger =
      refDropdown.current.getBoundingClientRect().width >
      refHead.current.getBoundingClientRect().width

    // restore dropdown state
    if (!dropdownDisplayed) {
      refDropdown.current.style.visibility = 'unset'
      refDropdown.current.classList.add('noned')
    }

    if (dropdownLarger) {
      if (!maxWidth) setMaxWidth(true)
      return
    }

    refDropdown.current.classList.remove('max-width')
    setMaxWidth(false)
  }, [currentValue])

  let currentValueDisplay = null

  switch (currentValue) {
    case 'time':
      currentValueDisplay = 'за часом появи'
      break

    case 'price':
      currentValueDisplay = 'за ціною'
      break

    case 'name':
      currentValueDisplay = 'за назвою'
      break

    default:
      currentValueDisplay = 'unknown'
  }

  return (
    <div className="dropdown-container">
      <div
        className="dropdown-container__head"
        ref={refHead}
        onClick={() => setDropdownDisplayed(!dropdownDisplayed)}
      >
        {currentValueDisplay}
      </div>
      <ul
        className={`dropdown${maxWidth ? ' max-width' : ''}${!dropdownDisplayed ? ' noned' : ''}`}
        ref={refDropdown}
        role="listbox"
      >
        {values.map(v => {
          switch (v) {
            case 'time':
              return (
                <li
                  className="dropdown__item"
                  onClick={() => {
                    currentValueChangeCb(v)
                    setDropdownDisplayed(false)
                  }}
                  id={v}
                  key={v}
                  role="option"
                  aria-selected={currentValue === v}
                >
                  за часом появи
                </li>
              )

            case 'price':
              return (
                <li
                  className="dropdown__item"
                  onClick={() => {
                    currentValueChangeCb(v)
                    setDropdownDisplayed(false)
                  }}
                  id={v}
                  key={v}
                  role="option"
                  aria-selected={currentValue === v}
                >
                  за ціною
                </li>
              )

            case 'name':
              return (
                <li
                  className="dropdown__item"
                  onClick={() => {
                    currentValueChangeCb(v)
                    setDropdownDisplayed(false)
                  }}
                  id={v}
                  key={v}
                  role="option"
                  aria-selected={currentValue === v}
                >
                  за назвою
                </li>
              )
          }
        })}
      </ul>
    </div>
  )
}

export default Filters
