import React from 'react'
import { useParams } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'

const generatePage = (pageName: string) => {
    const component = () => require(`../pages/${pageName}`).default

    try {
        return React.createElement(component())
    } catch (err) {
        return <NotFound />
    }
}

const PageRender = () => {
    const { page, id }: any = useParams()
    const { auth }: any = useSelector(state => state)

    let pageName = ''

    if (auth.token) {
        if (id) {
            pageName = `${page}/[id]`
        } else {
            pageName = `${page}`
        }
    }

    return generatePage(pageName)
}

export default PageRender
