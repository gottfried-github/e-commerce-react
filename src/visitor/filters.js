import React, {useState, useEffect, useRef} from 'react'

function Filters({
    fieldName, dir, inStock,
    fieldNameChangeCb, dirChangeCb, inStockChangeCb
}) {
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
                {
                    inStock ? 'наявні' : 'усі'
                }
            </li>

            <FilterDropdown 
                currentValue={fieldName}
                values={fieldNames}
                currentValueChangeCb={(currentValue) => {
                    fieldNameChangeCb(currentValue)
                }}
            />
        </ul>
    )
}

function FilterDropdown({currentValue, values, currentValueChangeCb}) {
    const refHead = useRef()
    const refDropdown = useRef()
    const [maxWidth, setMaxWidth] = useState(false)

    let currentValueDisplay = null

    switch (currentValue) {
        case 'time': 
            currentValueDisplay = 'за часом появи'
            break;
        
        case 'price': 
            currentValueDisplay = 'за ціною'
            break;
            
        case 'name': 
            currentValueDisplay = 'за назвою'
            break;

        default:
            currentValueDisplay = 'unknown'
    }

    /* see Dropdown width and positioning in readme */
    useEffect(() => {
        if (!maxWidth) refDropdown.current.classList.add('max-width')
        const larger = refDropdown.current.getBoundingClientRect().width > refHead.current.getBoundingClientRect().width

        if (larger) return

        refDropdown.current.classList.remove('max-width')
        setMaxWidth(false)
    }, [currentValue])

    return (
        <div className="dropdown-container">
            <div className="dropdown-container__head" ref={refHead}>
                {
                    currentValueDisplay
                }
            </div>
            <ul className={`dropdown${maxWidth ? ' max-width' : ''}`} ref={refDropdown}>
                {
                    values.map((v) => {
                        switch(v) {
                            case 'time': 
                                return <li 
                                    className="dropdown__item"
                                    onClick={() => currentValueChangeCb(v)}
                                >
                                    за часом появи
                                </li>

                            case 'price':
                                return <li 
                                    className="dropdown__item"
                                    onClick={() => currentValueChangeCb(v)}
                                >
                                    за ціною
                                </li>

                            case 'name':
                                return <li 
                                    className="dropdown__item"
                                    onClick={() => currentValueChangeCb(v)}
                                >
                                    за назвою
                                </li>
                        }
                    })
                }
            </ul>
        </div>
    )
}

export default Filters