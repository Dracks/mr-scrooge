import { Box, Heading } from "grommet";
import React from "react";

import { useApiClient } from "../../../api/client";
import { Rule, RuleCondition } from "../../../api/models";
import { useLogger } from "../../../utils/logger/logger.context";
import { RuleEnriched } from "../rule-enriched";
import { EditCondition } from "./edit-condition";
import { NewCondition } from "./new-condition";

export const ConditionsList: React.FC<{ rule: RuleEnriched, updateRule: (r: Rule)=>void }> = ({ rule }) => {
    const logger = useLogger()
    const client = useApiClient()
    
    const [conditions, setConditions] = React.useState<RuleCondition[]>(rule.conditions)
    
    React.useEffect(()=>{
        setConditions(rule.conditions)
    }, [rule.id])
    
    
    return <>
        <Heading level="3">Conditions</Heading>
        <Box data-testid="conditions-container">
          {conditions.map((condition) => (
              <EditCondition condition={condition} key={condition.id} />
          ))}
          <NewCondition />
        </Box>
    </>
}