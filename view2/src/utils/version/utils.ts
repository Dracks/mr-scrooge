export const getMetaTag = (name: string) => {
    const tagsList = document.getElementsByName(name)
    if (tagsList.length > 0) {
        return tagsList[0] as HTMLMetaElement
    } else {
        return null
    }
}
