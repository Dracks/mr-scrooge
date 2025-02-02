/** eslint-disable @typescript-eslint/no-unused-vars */
/** eslint-disable @typescript-eslint/require-await */
import { act, fireEvent, queries, render, screen } from '@testing-library/react';
import { setupServer, SetupServerApi } from 'msw/node';
import React from 'react';

import { ProvideApi } from '../../api/client';
import { OperationDouble, OperationString, Rule, RuleCondition } from '../../api/models';
import { labelFactory } from '../../utils/data-factory/label.factory';
import { conditionFactory, ruleEnhancedFactory } from '../../utils/data-factory/rule.factory';
import { http } from '../../utils/test/set-up-server';
import { operationText } from './conditions/condition-helpers';
import { EditRule } from './edit-rule';
import { RuleEnriched } from './rule-enriched';
import { RuleContext, RulesDataContext } from './rule-loaded';

describe(`[${EditRule.name}]`, () => {
    let server: SetupServerApi;
    let refresh: jest.Mock;
    let updateRaw: jest.Mock;

    beforeEach(() => {
        server = setupServer();
        server.listen();
        refresh = jest.fn();
        updateRaw = jest.fn();
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        server.close();
    });

    const renderRule = (elem: React.ReactElement, rules: RuleEnriched[]) => {
        const ruleContext: RuleContext = {
            list: rules,
            map: new Map(rules.map(rule => [rule.id, rule])),
            refresh,
            updateRaw,
        };
        return render(
            <ProvideApi server="http://localhost">
                <RulesDataContext.Provider value={ruleContext}>{elem}</RulesDataContext.Provider>
            </ProvideApi>,
        );
    };

    it('It renders a rule with conditions and labels', async () => {
        await act(async () => {
            renderRule(<EditRule id={'aa-bb-cc'} />, [
                ruleEnhancedFactory.build({
                    id: 'aa-bb-cc',
                    name: 'Some rule name',
                    labels: [labelFactory.build({ name: 'label1' }), labelFactory.build({ name: 'label2' })],
                    conditions: labelFactory.buildList(5),
                }),
            ]);
            await Promise.resolve({});
        });
        expect(screen.getByTestId('heading').textContent).toBe('Edit rule: Some rule name');
        const spans = screen.getByTestId('label-list').getElementsByTagName('span');
        expect(Array.from(spans).map(span => span.textContent)).toContain('label1');
        expect(Array.from(spans).map(span => span.textContent)).toContain('label2');
        expect(screen.getByTestId('conditions-container').children.length).toEqual(5 + 1);
    });

    it('It renders not found', async () => {
        await act(async () => {
            renderRule(<EditRule id={'not found'} />, []);
            await Promise.resolve({});
        });
        expect(screen.getByTestId('heading').textContent).toBe('Not Found');
    });

    const changeSelection = (form: HTMLFormElement, selection: OperationString | OperationDouble) => {
        const buttonSelect = form.getElementsByTagName('button')[0] as HTMLButtonElement;
        fireEvent.click(buttonSelect);
        const options = screen.getAllByRole('option');
        const selectionText = operationText[selection];
        const option = options.find(elem => elem.textContent === selectionText);
        expect(option).toBeTruthy();
        fireEvent.click(option as HTMLHtmlElement);
    };

    const retrieveCondition = async (conditionForm: HTMLFormElement) => {
        const conditionValue = await queries.findByTestId(conditionForm, 'condition-value');
        const conditionSelect = await queries.findByTestId(conditionForm, 'condition-operation');

        return {
            conditionValue: conditionValue as HTMLInputElement,
            conditionSelect: conditionSelect as HTMLInputElement,
        };
    };

    describe('New condition', () => {
        let newConditionRequest: jest.Mock;
        let rules: RuleEnriched[];
        beforeEach(() => {
            rules = [
                ruleEnhancedFactory.build({
                    id: 'aa-bb-cc',
                    name: 'Some rule name',
                    conditions: conditionFactory.buildList(3),
                }),
            ];
            newConditionRequest = jest.fn();
            server.use(
                http.post('/rules/{ruleId}/condition', async ({ request, params, response }) => {
                    const ruleId = params.ruleId;
                    const sentData = await request.json();
                    newConditionRequest(ruleId, sentData);
                    const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        labels: _labels,
                        conditions,
                        ...currentRule
                    } = rules.find(rule => rule.id === ruleId) as RuleEnriched;
                    return response(200).json({
                        ...currentRule,
                        labelIds: [],
                        conditions: [...conditions, { id: 'new-rule-id', ...sentData.condition }],
                    });
                }),
            );
        });

        const getCreateCondition = () => {
            const conditionsForm = screen.getAllByTestId('condition-form');
            return conditionsForm[conditionsForm.length - 1] as HTMLFormElement;
        };

        it('Renders the new condition form', async () => {
            renderRule(<EditRule id={'aa-bb-cc'} />, rules);

            const createCondition = getCreateCondition();

            expect(screen.getAllByTestId('condition-form').length).toEqual(4);

            const { conditionSelect, conditionValue } = await retrieveCondition(createCondition);
            expect(conditionSelect.value).toBe('contains');

            changeSelection(createCondition, 'less');

            expect(conditionSelect.value).toBe(operationText['less']);

            expect(conditionValue.type).toEqual('number');

            changeSelection(createCondition, 'suffix');
            expect(conditionValue.type).toEqual('text');
        });

        it('Adding a new condition', async () => {
            renderRule(<EditRule id={'aa-bb-cc'} />, rules);

            const createCondition = getCreateCondition();

            const { conditionValue } = await retrieveCondition(createCondition);

            changeSelection(createCondition, 'greaterEqual');

            fireEvent.change(conditionValue, { target: { value: '1234' } });
            await act(async () => {
                fireEvent.click(screen.getByTestId('create-condition-button'));
                await Promise.resolve();
            });

            expect(newConditionRequest).toHaveBeenCalledTimes(1);
            expect(newConditionRequest).toHaveBeenCalledWith('aa-bb-cc', expect.anything());

            expect(updateRaw).toHaveBeenCalledTimes(1);
            expect(updateRaw).toHaveBeenCalledWith(
                expect.objectContaining<Partial<Rule>>({
                    conditions: expect.arrayContaining([
                        {
                            id: 'new-rule-id',
                            value: '1234',
                            operation: 'greaterEqual',
                        },
                    ]) as RuleCondition[],
                }),
            );
        });
    });

    describe('Edit condition', () => {
        let updateConditionRequest: jest.Mock;
        let rules: RuleEnriched[];
        beforeEach(() => {
            rules = [
                ruleEnhancedFactory.build({
                    id: 'aa-bb-cc',
                    name: 'Some rule name',
                    conditions: [conditionFactory.build({ id: 'cond-id-32' })],
                }),
            ];
            updateConditionRequest = jest.fn();
            server.use(
                http.put('/rules/{ruleId}/condition/{condId}', async ({ request, params, response }) => {
                    const { ruleId, condId } = params;
                    const sentData = await request.json();
                    updateConditionRequest(ruleId, condId, sentData);
                    const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        labels: _labels,
                        conditions,
                        ...currentRule
                    } = rules.find(rule => rule.id === ruleId) as RuleEnriched;
                    return response(200).json({
                        ...currentRule,
                        labelIds: [],
                        conditions: [
                            ...conditions.filter(({ id }) => id != condId),
                            { id: condId, ...sentData.condition },
                        ],
                    });
                }),
            );
        });

        const getCondition = () => {
            return screen.getAllByTestId('condition-form')[0] as HTMLFormElement;
        };

        it('Updates the condition', async () => {
            renderRule(<EditRule id={'aa-bb-cc'} />, rules);

            const conditionToUpdate = getCondition();

            const { conditionValue } = await retrieveCondition(conditionToUpdate);

            changeSelection(conditionToUpdate, 'lessEqual');

            fireEvent.change(conditionValue, { target: { value: '1234' } });
            await act(async () => {
                fireEvent.click(screen.getByTestId('save-condition-button'));
                await Promise.resolve();
            });

            expect(updateConditionRequest).toHaveBeenCalledTimes(1);
            expect(updateConditionRequest).toHaveBeenCalledWith('aa-bb-cc', 'cond-id-32', expect.anything());

            expect(updateRaw).toHaveBeenCalledTimes(1);
            expect(updateRaw).toHaveBeenCalledWith(
                expect.objectContaining<Partial<Rule>>({
                    conditions: expect.arrayContaining([
                        {
                            id: 'cond-id-32',
                            value: '1234',
                            operation: 'lessEqual',
                        },
                    ]) as RuleCondition[],
                }),
            );
        });
    });

    describe('Delete condition', () => {
        let deleteConditionRequest: jest.Mock;
        let rules: RuleEnriched[];
        beforeEach(() => {
            rules = [
                ruleEnhancedFactory.build({
                    id: 'aa-bb-cc',
                    name: 'Some rule name',
                    conditions: [conditionFactory.build({ id: 'cond-id-42' })],
                }),
            ];
            deleteConditionRequest = jest.fn();
            server.use(
                http.delete('/rules/{ruleId}/condition/{condId}', ({ params, response }) => {
                    const { ruleId, condId } = params;
                    deleteConditionRequest(ruleId, condId);
                    const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        labels: _labels,
                        conditions,
                        ...currentRule
                    } = rules.find(rule => rule.id === ruleId) as RuleEnriched;
                    return response(200).json({
                        ...currentRule,
                        labelIds: [],
                        conditions: [...conditions.filter(({ id }) => id != condId)],
                    });
                }),
            );
        });

        const getCondition = () => {
            return screen.getAllByTestId('condition-form')[0] as HTMLFormElement;
        };

        const deleteCondition = async (form: HTMLFormElement) => {
            const deleteButton = queries.getByTestId(form, 'confirmation-button');

            fireEvent.click(deleteButton);
            await Promise.resolve();

            const yesButton = screen.getByTestId('confirmation-button-yes');

            expect(yesButton).toBeTruthy();
            await act(async () => {
                fireEvent.click(yesButton);
                await Promise.resolve();
            });
        };

        it('Deletes the condition', async () => {
            renderRule(<EditRule id={'aa-bb-cc'} />, rules);

            const conditionToDelete = getCondition();

            await deleteCondition(conditionToDelete);

            expect(deleteConditionRequest).toHaveBeenCalledTimes(1);
            expect(deleteConditionRequest).toHaveBeenCalledWith('aa-bb-cc', 'cond-id-42');

            expect(updateRaw).toHaveBeenCalledTimes(1);
            expect(updateRaw).toHaveBeenCalledWith(
                expect.objectContaining<Partial<Rule>>({
                    conditions: [],
                }),
            );
        });
    });
});
