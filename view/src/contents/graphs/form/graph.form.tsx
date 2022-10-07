import { instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { Box, Button, CheckBox, Form, FormField, Heading, ResponsiveContext, Select, TextInput } from 'grommet';
import { Add, Analytics } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

import { DateRange, GraphGroupEnum, GraphKind, GraphV2 } from '../../../api/client/graphs/types';
import { useLogger } from '../../../utils/logger/logger.context';
import { ConfirmationButton } from '../../../utils/ui/confirmation-button';
import { InputTag } from '../../../utils/ui/tag/input-tag';
import { useTagsContext } from '../../common/tag.context';
import { enrichGraph } from '../graph-with-rechart/enrich-graph';
import { GraphViewer } from '../graph-with-rechart/view';
import { graphToUi, GraphUiRepresentation, uiToGraph } from './graph.transformer';

interface GraphFormProps<T extends Partial<GraphV2>> {
    graphData: T;
    save: () => Promise<void>;
    update: (graphData: T) => void;
}

const GraphPlaceholder: React.FC<{}> = () => {
    return (
        <Box direction="column" pad="small" width={{ min: '450px' }}>
            <Box height={'400px'} width="fill" background="light-2" justify="center" align="center">
                <Analytics size="large" />
            </Box>
        </Box>
    );
};

const DateRangeOptions: Array<{ id: DateRange; label: string }> = [
    { id: DateRange.oneMonth, label: 'One month' },
    { id: DateRange.halfYear, label: 'Half year' },
    { id: DateRange.oneYear, label: 'One year' },
    { id: DateRange.twoYears, label: 'Two years' },
    { id: DateRange.all, label: 'all' },
];

export const GraphForm: <T extends Partial<GraphV2>>(p: GraphFormProps<T>) => React.ReactElement<GraphFormProps<T>> = <
    T extends Partial<GraphV2>,
>({
    graphData,
    update,
    save,
}: GraphFormProps<T>) => {
    const { tags, tagsMap } = useTagsContext();
    const tagsPair = tags.map(({ id, name }) => ({ id, name }));
    const navigate = useNavigate();

    const size = React.useContext(ResponsiveContext);
    const hasHorizontal = graphData.kind === GraphKind.bar || graphData.kind === GraphKind.line;
    const graphEnabled = (graphData.kind && graphData.group && !hasHorizontal) || graphData.horizontalGroup;
    const graphUi = graphToUi(graphData);
    const updateGraph = (data: GraphUiRepresentation) => {
        update(uiToGraph(data) as T);
    };
    useLogger().info('Graph Form', { graphData, graphUi });
    return (
        <Form<GraphUiRepresentation>
            value={graphUi}
            onChange={newValue => updateGraph(newValue)}
            onSubmit={async () => {
                await save();
            }}
        >
            <Box direction={size === 'small' ? 'column' : 'row'} width="fill">
                {graphEnabled ? <GraphViewer graph={enrichGraph(graphData as GraphV2, tags)} /> : <GraphPlaceholder />}
                <Box>
                    <FormField name="name" label="Graph name" component={TextInput} />
                    <FormField label="Graph kind" name="kind" component={Select} options={Object.values(GraphKind)} />
                    <FormField name="tag" htmlFor="select-for-tag-filter" label="Tag filter">
                        <Select
                            id="select-for-tag-filter"
                            name="tagFilter"
                            options={tagsPair}
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
                            options={Object.values(GraphGroupEnum)}
                            component={Select}
                        />
                        {graphUi.groupKind === GraphGroupEnum.tags && (
                            <React.Fragment>
                                <FormField label="Tags to group" htmlFor="select-group-tags">
                                    <InputTag
                                        value={graphUi.groupTags?.map(tagId => tagsMap[tagId]) ?? []}
                                        onAdd={tag =>
                                            updateGraph({
                                                ...graphUi,
                                                groupTags: [...(graphUi.groupTags ?? []), tag.id],
                                            })
                                        }
                                        onRemove={tag =>
                                            updateGraph({
                                                ...graphUi,
                                                groupTags: (graphUi.groupTags ?? []).filter(tagId => tagId != tag.id),
                                            })
                                        }
                                        suggestions={tags}
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
                                options={Object.values(GraphGroupEnum)}
                                component={Select}
                            />
                            {graphUi.kind === GraphKind.line && (
                                <FormField label="Acumulate values" name="horizontalAccumulate" component={CheckBox} />
                            )}
                            {graphUi.horizontalGroupKind === GraphGroupEnum.tags && (
                                <React.Fragment>
                                    <FormField label="Tags to group" htmlFor="select-x-group-tags">
                                        <InputTag
                                            value={graphUi.horizontalGroupTags?.map(tagId => tagsMap[tagId]) ?? []}
                                            onAdd={tag =>
                                                updateGraph({
                                                    ...graphUi,
                                                    horizontalGroupTags: [
                                                        ...(graphUi.horizontalGroupTags ?? []),
                                                        tag.id,
                                                    ],
                                                })
                                            }
                                            onRemove={tag =>
                                                updateGraph({
                                                    ...graphUi,
                                                    horizontalGroupTags: (graphUi.horizontalGroupTags ?? []).filter(
                                                        tagId => tagId != tag.id,
                                                    ),
                                                })
                                            }
                                            suggestions={tags}
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
                        <Button primary label="Save" type="submit" />
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
