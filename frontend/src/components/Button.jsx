import React from 'react'

export default function Button({ children, variant = 'primary', id, onClick, as, href, download }) {
  const className = `btn btn-${variant}`

  if (as === 'a') {
    return (
      <a id={id} href={href} download={download} className={className}>
        {children}
      </a>
    )
  }

  return (
    <button id={id} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
