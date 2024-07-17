import React from 'react'

const IconFacebook = ({ className }) => {
  const clipPathId = Date.now().toString()

  return (
    <svg
      className={className || ''}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#${clipPathId})`}>
        <path d="M16 0C7.20001 0 0 7.20001 0 16C0 23.92 5.75938 30.4806 13.3594 31.8406L13.4563 31.7625C13.451 31.7616 13.4459 31.7603 13.4406 31.7594V20.4797H9.44063V16H13.4406V12.4797C13.4406 8.47969 15.9997 6.24063 19.6797 6.24063C20.7997 6.24063 22.08 6.39938 23.2 6.55938V10.6406H21.1203C19.2003 10.6406 18.7203 11.5997 18.7203 12.8797V16H22.9594L22.2406 20.4797H18.7203V31.7594C18.6704 31.7684 18.6202 31.7743 18.5703 31.7828L18.6406 31.8406C26.2406 30.4806 32 23.92 32 16C32 7.20001 24.8 0 16 0Z" />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default IconFacebook
