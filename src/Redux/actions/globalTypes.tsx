export enum GLOBALTYPES {
    AUTH = 'AUTH',
    ALERT = 'ALERT',
    THEME = 'THEME',
    STATUS = 'STATUS',
    MODAL = 'MODAL',
    SOCKET = 'SOCKET',
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    CALL = 'CALL',
    PEER = 'PEER',
}

export const EditData = (data: { _id: string }[], id: string, post?: string | null) => {
    const newData = data.map(item => (item._id === id ? post : item))
    return newData
}

export const DeleteData = (data: { _id: string }[], id: string | null) => {
    const newData = data.filter(item => item._id !== id)
    return newData
}
