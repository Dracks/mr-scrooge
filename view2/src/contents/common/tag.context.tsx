import React, { useMemo } from "react";
import { useContext } from "react";
import { Tag } from "../../api/client/tag/types";
import { useGetTags } from "../../api/client/tag/use-get-tags";
import ErrorHandler from "../../api/helpers/request-error.handler";
import { LoadingPage } from "../../utils/ui/loading";


interface ITagContext {
    tags: Tag[],
    tagsHash: Record<number, Tag>
    refresh: ()=> Promise<void>
}

const TagContext = React.createContext<ITagContext>({
    tags: [],
    tagsHash: {},
    refresh: ()=>Promise.resolve(),
})

export const useTagsListContext = (): Tag[] => {
    const {tags} = useContext(TagContext)
    return tags
}

export const useTagsContext = (): ITagContext => useContext(TagContext)


const useGenerateHash = (tags: Tag[]):Record<number, Tag>=> {
    return React.useMemo(()=>
        tags.reduce((ac, tag) =>{
            ac[tag.id] = tag
            return ac
        } , {} as Record<number, Tag>)
    , [tags])
}

export const ProvideTagsData : React.FC = ({children}) => {
    const [query, refresh] = useGetTags()
    const tagsHash = useGenerateHash(query.data ?? [])

    if (query.data && !query.error){
        const context : ITagContext = {
            tags: query.data,
            tagsHash,
            refresh: async ()=>{await refresh()}
        }
        return <TagContext.Provider value={context}>{children}</TagContext.Provider>
    } else if (query.loading){
        <LoadingPage />
    } else if (query.error){
        return <ErrorHandler error={query.error} />
    }
    return <div />
}