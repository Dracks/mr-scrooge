import { Box, Button, CheckBox, Form, FormField, Heading, ResponsiveContext, Select, TextInput } from 'grommet';
import { Analytics } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { GQLGraphDateRange, GQLGraphGroup, GQLGraphKind, GQLLabel, GQLNewGraph } from '../../../api/graphql/generated';
import { useLogger } from '../../../utils/logger/logger.context';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { InputTag } from '../../../utils/ui/tag/input-tag';
import { useLabelsContext } from '../../common/label.context';
import { enrichGraph } from '../graph-with-rechart/enrich-graph';
import { GraphViewer } from '../graph-with-rechart/view';
import { graphToUi, GraphUiRepresentation, uiToGraph } from './graph.transformer';

interface GraphFormProps<T extends GQLNewGraph> {
    graphData: Partial<T>;
    save: () => Promise<void>;
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

const DateRangeOptions: Array<{ id: GQLGraphDateRange; label: string }> = [
    { id: GQLGraphDateRange.OneMonth, label: 'One month' },
    { id: GQLGraphDateRange.HalfYear, label: 'Half year' },
    { id: GQLGraphDateRange.OneYear, label: 'One year' },
    { id: GQLGraphDateRange.TwoYears, label: 'Two years' },
    { id: GQLGraphDateRange.All, label: 'all' },
];

export const GraphForm: <T extends GQLNewGraph>(p: GraphFormProps<T>) => React.ReactElement<GraphFormProps<T>> = <
    T extends GQLNewGraph,
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
    const hasHorizontal = graphData.kind === GQLGraphKind.Bar || graphData.kind === GQLGraphKind.Line;
    const graphEnabled = graphData.kind && graphData.group && (!hasHorizontal || graphData.horizontalGroup);
    const graphUi = graphToUi(graphData);
    const updateGraph = (data: GraphUiRepresentation) => {
        update(uiToGraph(data) as T);
    };
    useLogger().info('Graph Form', { graphData, graphUi });

    return (
        <Form<GraphUiRepresentation>
            value={graphUi}
            onChange={newValue => {
                updateGraph(newValue);
            }}
            onSubmit={async () => {
                await save();
            }}
        >
            <Box direction={size === 'small' ? 'column' : 'row'} width="fill">
                {graphEnabled ? <GraphViewer graph={enrichGraph(graphData as T, labels)} /> : <GraphPlaceholder />}
                <Box>
                    <FormField name="name" label="Graph name" component={TextInput} />
                    <FormField
                        label="Graph kind"
                        name="kind"
                        component={Select}
                        options={Object.values(GQLGraphKind)}
                    />
                    <FormField name="tag" htmlFor="select-for-tag-filter" label="Tag filter">
                        <Select
                            id="select-for-tag-filter"
                            name="tagFilter"
                            options={labelsPair}
                            placeholder="No tag filter selected"
                            labelKey="name"
                            valueKey={{ key: 'id', reduce: true }}
                            clear={{ label: 'No filter' }}
                        />
                    </FormField>
                    <FormField name="dateRange" htmlFor="select-date-range" label="Date range">
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
                        <FormField
                            label="Group type"
                            name="groupKind"
                            options={Object.values(GQLGraphGroup)}
                            component={Select}
                        />
                        {graphUi.groupKind === GQLGraphGroup.Labels && (
                            <React.Fragment>
                                <FormField label="Tags to group" htmlFor="select-group-tags">
                                    <InputTag
                                        value={
                                            graphUi.groupLabels?.map(labelId => labelsMap.get(labelId) as GQLLabel) ??
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
                            <FormField
                                label="Group type"
                                name="horizontalGroupKind"
                                options={Object.values(GQLGraphGroup)}
                                component={Select}
                            />
                            {graphUi.kind === GQLGraphKind.Line && (
                                <FormField label="Acumulate values" name="horizontalAccumulate" component={CheckBox} />
                            )}
                            {graphUi.horizontalGroupKind === GQLGraphGroup.Labels && (
                                <React.Fragment>
                                    <FormField label="Tags to group" htmlFor="select-x-group-tags">
                                        <InputTag
                                            value={
                                                graphUi.horizontalGroupLabels?.map(
                                                    labelId => labelsMap.get(labelId) as GQLLabel,
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
