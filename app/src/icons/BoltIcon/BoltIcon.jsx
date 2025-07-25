import React from 'react'

export const BoltIcon = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height={props.size || '24px'}
      viewBox="0 -960 960 960" 
      width={props.size || '24px'}
      fill={props.color || '#e8eaed'}
    >
      <path d="m422-232 207-248H469l29-227-185 267h139l-30 208ZM320-80l40-280H160l360-520h80l-40 320h240L400-80h-80Zm151-390Z"/>
    </svg>
  )
}
