import React from 'react';

import { useApiClient } from '../../api/client';
import { ApiUUID, Rule } from '../../api/models';
import { usePagination } from '../../api/pagination';
import { useLogger } from '../../utils/logger/logger.context';
import { LoadingPage } from '../../utils/ui/loading';
import { useLabelsContext } from '../common/label.context';
import { enrichRuleList, RuleEnriched, toApiRule } from './rule-enriched';
import { RuleRouter } from './rule-router';

export interface RuleContext {
    list: RuleEnriched[];
    map: Map<ApiUUID, RuleEnriched>;
    refresh: (toDelete?: RuleEnriched) => void;
    updateRaw: (rule: Rule) => void;
}

export const RulesDataContext = React.createContext<RuleContext>({ list: [], map: new Map(), refresh: () => undefined, updateRaw: ()=>undefined });
export const useRuleCtx = () => React.useContext(RulesDataContext);

export const RulesLoaded: React.FC = () => {
    const logger = useLogger('RulesLoaded');
    const client = useApiClient();
    const [firstCompletion, setFirstCompletion] = React.useState<boolean>(false);
    const { labelsMap } = useLabelsContext();
    const paginatedRules = usePagination(
        async next => {
            const { data } = await client.GET('/rules', { params: { query: { cursor: next } } });
            if (data) {
                return data;
            } else {
                throw Error("Get rules didn't had data");
            }
        },
        { autostart: true, hash: data => data.id },
    );

    const rulesEnriched = enrichRuleList(paginatedRules.loadedData, labelsMap);

    if (paginatedRules.status === 'completed' || firstCompletion) {
        if (!firstCompletion) {
            setFirstCompletion(true);
        }
        const ctx: RuleContext = {
            list: rulesEnriched.rules,
            map: rulesEnriched.rulesMap,
            updateRaw: (rule: Rule)=>{paginatedRules.update([rule])},
            refresh: toDelete => {
                if (toDelete) {
                    paginatedRules.deleteElement(toApiRule(toDelete));
                }
                paginatedRules.reset();
            },
        };
        return (
            <RulesDataContext.Provider value={ctx}>
                <RuleRouter />
            </RulesDataContext.Provider>
        );
    }
    if (paginatedRules.status === 'loading') {
        return <LoadingPage />;
    }
    logger.error('Error loading the rules', paginatedRules.error);
    return <div>Error loading the rules</div>;
};
