import React from 'react'
import { useSelector } from 'react-redux'

const Avatar = ({ src, size }: { src: string; size: string }) => {
    const { theme }: any = useSelector(state => state)

    return (
        <img
            src={src}
            alt="avatar"
            className={size}
            style={{ filter: `${theme ? 'invert(1)' : 'invert(0)'}` }}
        />
    )
}

export default Avatar
