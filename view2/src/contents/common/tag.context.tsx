import React from "react";
import { useContext } from "react";
import { Tag } from "../../api/client/tag/types";
import { useGetTags } from "../../api/client/tag/use-get-tags";
import ErrorHandler from "../../api/helpers/request-error.handler";
import { LoadingPage } from "../../utils/ui/loading";

const TagContext = React.createContext<Tag[]>([])

export const useTagContext = (): Tag[] => useContext(TagContext)

export const ProvideTagsData : React.FC = ({children}) => {
    const [query] = useGetTags()

    if (query.loading){
        <LoadingPage />
    } else if (query.error){
        return <ErrorHandler error={query.error} />
    } else if (query.data){
        return <TagContext.Provider value={query.data}>{children}</TagContext.Provider>
    }
    return <div />
}