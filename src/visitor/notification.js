import React from 'react'

const Notification = ({ children, hidden }) => {
  return <div className={`notification-container${hidden ? ' hidden' : ''}`}>{children}</div>
}

export default Notification
