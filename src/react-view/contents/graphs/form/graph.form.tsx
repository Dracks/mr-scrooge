import { Box, Button, CheckBox, Form, FormField, Heading, ResponsiveContext, Select, TextInput } from 'grommet';
import { Analytics } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { GraphDateRange, GraphKind, GraphParam, GroupType, Label } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { EnumSelectOption } from '../../../utils/ui/enum-option';
import { InputTag } from '../../../utils/ui/tag/input-tag';
import { useLabelsContext } from '../../common/label.context';
import { enrichGraph } from '../graph-with-rechart/enrich-graph';
import { GraphViewer } from '../graph-with-rechart/view';
import { graphToUi, GraphUiRepresentation, uiToGraph } from './graph.transformer';

interface GraphFormProps<T extends GraphParam> {
    graphData: Partial<T>;
    save: () => void;
    update: (graphData: T) => void;
}

const GraphPlaceholder: React.FC = () => {
    return (
        <Box direction="column" pad="small" width={{ min: '450px' }}>
            <Box height={'400px'} width="fill" background="light-2" justify="center" align="center">
                <Analytics size="large" />
            </Box>
        </Box>
    );
};

const DateRangeOptions: EnumSelectOption<GraphDateRange>[] = [
    { id: "oneMonth", label: 'One month' },
    { id: "halfYear", label: 'Half year' },
    { id: "oneYear", label: 'One year' },
    { id: "twoYears", label: 'Two years' },
    { id: "all", label: 'all' },
];

const KindOptions:EnumSelectOption<GraphKind>[] = [
    {id: "bar", label: 'Bar'},
    {id: "line", label: 'Line'},
    { id: "pie", label: "Pie"}
]

const GroupOptions: EnumSelectOption<GroupType>[] = [
    {id: "sign", label: "Sign (positive/negative)"},
    {id: "day", label: 'Day'},
    {id: "month", label: "Month"},
    {id: "year", label: "Year"},
    {id: "labels", label: 'Labels'},
]

export const GraphForm: <T extends GraphParam>(p: GraphFormProps<T>) => React.ReactElement<GraphFormProps<T>> = <
    T extends GraphParam,
>({
    graphData,
    update,
    save,
}: GraphFormProps<T>) => {
    const { labels: allLabels, labelsMap } = useLabelsContext();
    const labels = allLabels.filter(({ groupOwnerId }) => graphData.groupOwnerId === groupOwnerId);
    const labelsPair = labels.map(({ id, name }) => ({ id, name }));
    const navigate = useNavigate();

    const size = React.useContext(ResponsiveContext);
    const hasHorizontal = graphData.kind === "bar" || graphData.kind === "line";
    const graphEnabled = graphData.kind && graphData.group && (!hasHorizontal || graphData.horizontalGroup);
    const graphUi = graphToUi(graphData);
    const updateGraph = (data: GraphUiRepresentation) => {
        update(uiToGraph(data) as T);
    };
    useLogger().info('Graph Form', { graphData, graphUi, graphEnabled, hasHorizontal });

    return (
        <Form<GraphUiRepresentation>
            value={graphUi}
            onChange={newValue => {
                updateGraph(newValue);
            }}
            onSubmit={() => {
                save();
            }}
        >
            <Box direction={size === 'small' ? 'column' : 'row'} width="fill">
                {graphEnabled ? <GraphViewer graph={enrichGraph(graphData as T, labels)} /> : <GraphPlaceholder />}
                <Box>
                    <FormField name="name" label="Graph name" component={TextInput} />
                    <FormField
                        label="Graph kind"
                        htmlFor="select-for-kind"
                        >
                        <Select
                            id="select-for-kind"
                            name="kind"
                            options={KindOptions}
                            labelKey="label"
                            valueKey={{ key: 'id', reduce: true }}
                        />
                    </FormField>
                    <FormField name="tag" htmlFor="select-for-tag-filter" label="Tag filter">
                        <Select
                            id="select-for-tag-filter"
                            name="labelFilterId"
                            options={labelsPair}
                            placeholder="No tag filter selected"
                            labelKey="name"
                            valueKey={{ key: 'id', reduce: true }}
                            clear={{ label: 'No filter' }}
                        />
                    </FormField>
                    <FormField htmlFor="select-date-range" label="Date range">
                        <Select
                            id="select-date-range"
                            options={DateRangeOptions}
                            name="dateRange"
                            labelKey="label"
                            valueKey={{ key: 'id', reduce: true }}
                        />
                    </FormField>
                    <Box>
                        <Heading level={5}>Group data</Heading>
                        <FormField label="Group type" htmlFor='select-for-group-type'>
                            <Select
                                id="select-for-group-type"
                                name="groupType"
                                options={GroupOptions}
                                labelKey="label"
                                valueKey={{ key: 'id', reduce: true }}
                            />
                        </FormField>
                        {graphUi.groupType === "labels" && (
                            <React.Fragment>
                                <FormField label="Tags to group" htmlFor="select-group-tags">
                                    <InputTag
                                        value={
                                            graphUi.groupLabels?.map(labelId => labelsMap.get(labelId) as Label) ??
                                            []
                                        }
                                        onAdd={tag => {
                                            updateGraph({
                                                ...graphUi,
                                                groupLabels: [...(graphUi.groupLabels ?? []), tag.id],
                                            });
                                        }}
                                        onRemove={tag => {
                                            updateGraph({
                                                ...graphUi,
                                                groupLabels: (graphUi.groupLabels ?? []).filter(
                                                    tagId => tagId !== tag.id,
                                                ),
                                            });
                                        }}
                                        suggestions={labels}
                                    />
                                </FormField>
                                <FormField label="Hide other tags" name="groupHideOthers" component={CheckBox} />
                            </React.Fragment>
                        )}
                    </Box>
                    {hasHorizontal && (
                        <Box>
                            <Heading level={5}>X axis</Heading>
                            <FormField label="Group type" htmlFor='select-for-horizontal-group-type'>
                            <Select
                                id="select-for-horizontal-group-type"
                                options={GroupOptions}
                                name="horizontalGroupType"
                                labelKey="label"
                                valueKey={{ key: 'id', reduce: true }}
                            />
                            </FormField>
                            {graphUi.kind === "line" && (
                                <FormField label="Acumulate values" name="horizontalAccumulate" component={CheckBox} />
                            )}
                            {graphUi.horizontalGroupType === "labels" && (
                                <React.Fragment>
                                    <FormField label="Tags to group" htmlFor="select-x-group-tags">
                                        <InputTag
                                            value={
                                                graphUi.horizontalGroupLabels?.map(
                                                    labelId => labelsMap.get(labelId) as Label,
                                                ) ?? []
                                            }
                                            onAdd={tag => {
                                                updateGraph({
                                                    ...graphUi,
                                                    horizontalGroupLabels: [
                                                        ...(graphUi.horizontalGroupLabels ?? []),
                                                        tag.id,
                                                    ],
                                                });
                                            }}
                                            onRemove={tag => {
                                                updateGraph({
                                                    ...graphUi,
                                                    horizontalGroupLabels: (graphUi.horizontalGroupLabels ?? []).filter(
                                                        tagId => tagId !== tag.id,
                                                    ),
                                                });
                                            }}
                                            suggestions={labels}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Hide other tags"
                                        name="horizontalGroupHideOthers"
                                        component={CheckBox}
                                    />
                                </React.Fragment>
                            )}
                        </Box>
                    )}
                    <Box direction="row" gap="small" justify="center">
                        <Button
                            primary
                            label="Save"
                            type="submit"
                            disabled={!graphEnabled || graphData.name?.length === 0 || !graphData.name}
                        />
                        <ConfirmationButton
                            color="accent-4"
                            label="discard"
                            onConfirm={() => {
                                navigate('/');
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Form>
    );
};
