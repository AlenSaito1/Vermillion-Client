export const checkImage = (file: { size: number; type: string }) => {
    if (!file) 'File does not exist.'
    if (file.size > 1024 * 1024) return 'The largest image size is 1mb.'
    if (file.type !== 'image/jpeg' && file.type !== 'image/png')
        return 'Image format is incorrect.'
    return ''
}

export const imageUpload = async (images: any[]) => {
    let imgArr = []
    for (const item of images) {
        const formData = new FormData()

        if (item.camera) formData.append('file', item.camera)
        else formData.append('file', item)

        formData.append('upload_preset', 'efxjficn')
        formData.append('cloud_name', 'devat-channel')

        const res = await fetch(
            'https://api.cloudinary.com/v1_1/drc1j4yzx/image/upload',
            {
                method: 'POST',
                body: formData,
            }
        )

        const data = await res.json()
        imgArr.push({ public_id: data.public_id, url: data.secure_url })
    }
    return imgArr
}
