import React from 'react'

export const imageShow = (src: string, theme: string) => {
    return (
        <img
            src={src}
            alt="images"
            className="img-thumbnail"
            style={{ filter: theme ? 'invert(1)' : 'invert(0)' }}
        />
    )
}

export const videoShow = (src: string, theme: string) => {
    return (
        <video
            controls
            src={src}
            className="img-thumbnail"
            style={{ filter: theme ? 'invert(1)' : 'invert(0)' }}
        />
    )
}
