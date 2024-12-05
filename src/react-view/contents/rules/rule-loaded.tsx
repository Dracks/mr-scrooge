import React from 'react'

import { useApi } from '../../api/client'
import { ApiUUID } from '../../api/models'
import { usePagination } from '../../api/pagination'
import { useLogger } from '../../utils/logger/logger.context'
import { LoadingPage } from '../../utils/ui/loading'
import { useLabelsContext } from '../common/label.context'
import { enrichRuleList, RuleEnriched, toApiRule } from './rule-enriched'
import { RuleRouter } from './rule-router'

interface RuleContext {
    list: RuleEnriched[]
    map: Map<ApiUUID, RuleEnriched>
    refresh: (toDelete?: RuleEnriched)=> void
}

export const RuleContext = React.createContext<RuleContext>({list: [], map: new Map(), refresh: ()=>undefined})
export const useRuleCtx = ()=> React.useContext(RuleContext)

export const RulesLoaded: React.FC = ()=>{
    const logger = useLogger("RulesLoaded")
    const client = useApi()
    const [firstCompletion, setFirstCompletion] = React.useState<boolean>(false)
    const {labelsMap} = useLabelsContext()
    const paginatedRules = usePagination(async (next)=>{
        const { data } = await client.GET("/rules", {params: {query: {cursor: next}}})
        if (data){
            return data
        } else {
            throw Error("Get rules didn't had data")
        }
    }, { autostart: true,  hash: (data)=>data.id})
    
    const rulesEnriched = enrichRuleList(paginatedRules.loadedData, labelsMap)
    
    if (paginatedRules.status === "completed" || firstCompletion){
        if (!firstCompletion) {
            setFirstCompletion(true)
        }
        const ctx : RuleContext= {
            list: rulesEnriched.rules, 
            map: rulesEnriched.rulesMap,
            refresh: (toDelete)=>{
                if (toDelete){
                    paginatedRules.deleteElement(toApiRule(toDelete))
                }
                paginatedRules.reset()
            }
        }
        return <RuleContext.Provider value={ctx}><RuleRouter/></RuleContext.Provider>
    }
    if (paginatedRules.status === "loading"){
        return <LoadingPage />
    }
    logger.error("Error loading the rules", paginatedRules.error)
    return <div>Error loading the rules</div>
    
}