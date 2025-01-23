/** eslint-disable @typescript-eslint/no-unused-vars */
/** eslint-disable @typescript-eslint/require-await */
import { act, render, screen } from '@testing-library/react';
import { setupServer, SetupServerApi } from 'msw/node'
import React from 'react';

import { EditRule } from "./edit-rule";
import { RuleEnriched } from './rule-enriched';
import { RuleContext, RulesDataContext } from './rule-loaded';
import { ruleEnhancedFactory, ruleFactory } from '../../utils/data-factory/rule.factory';
import { labelFactory } from '../../utils/data-factory/label.factory';

describe(`[${EditRule.name}]`, ()=>{
    
    let server: SetupServerApi
    let refresh: jest.Mock
    let updateRaw: jest.Mock
    
    beforeEach(()=>{
        server = setupServer()
        server.listen()
        refresh = jest.fn()
        updateRaw = jest.fn()
    })
    
    afterEach(()=>{
        server.close()
    })
    
    const renderRule = (elem: React.ReactElement, rules: RuleEnriched[])=>{
        const ruleContext: RuleContext = {
            list: rules,
            map: new Map(rules.map((rule)=>[rule.id, rule])),
            refresh,
            updateRaw
        }
        return render(<RulesDataContext.Provider value={ruleContext}>{elem}</RulesDataContext.Provider>)
    }
    
    it('It renders a rule with conditions and labels', async ()=>{
        await act(async () => {
            renderRule(<EditRule id={"aa-bb-cc"} />, [ruleEnhancedFactory.build({
                id: "aa-bb-cc",
                name: "Some rule name",
                labels: [labelFactory.build({name: "label1"}), labelFactory.build({name: "label2"})],
                conditions: labelFactory.buildList(5)
            })])
            await Promise.resolve({});
        })
        expect(screen.getByTestId("heading").textContent).toBe("Edit rule: Some rule name")
        const spans = screen.getByTestId("label-list").getElementsByTagName("span")
        expect(Array.from(spans).map(span => span.textContent)).toContain("label1")
        expect(Array.from(spans).map(span => span.textContent)).toContain("label2")
        expect(screen.getByTestId("conditions-container").children.length).toEqual(5+1)
    })
    
    it('It renders not found', async ()=>{
        await act(async () => {
            renderRule(<EditRule id={"not found"} />, [])
            await Promise.resolve({});
        })
        expect(screen.getByTestId("heading").textContent).toBe("Not Found")
    })
    
    describe("New condition", ()=>{
        
    })
    
})