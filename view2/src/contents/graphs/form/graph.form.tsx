import { Box, CheckBox, Form, FormField, Heading, ResponsiveContext, Select, TextInput } from "grommet";
import { Add, Analytics } from "grommet-icons";
import React from "react";
import { GraphKind, GraphV2 } from "../../../api/client/graphs/types";
import { useTagsContext } from "../../common/tag.context";
import { enrichGraph } from "../graph-with-rechart/enrich-graph";
import { GraphViewer } from "../graph-with-rechart/view";

interface GraphFormProps<T extends Partial<GraphV2>> {
    graphData: T,
    save: ()=>Promise<void>
    update: (graphData:T)=>void
}

type GraphFormType <T extends Partial<GraphV2>> = React.FC<GraphFormProps<T>>

const GraphPlaceholder: React.FC<{}> = ()=>{
    return <Box direction='column' pad='small' width={{min: "450px"}}>
        <Box height={"400px"} width="fill" background='light-2' justify="center" align="center">
            <Analytics size="large"/>
        </Box>
    </Box>
}

export const GraphFormPartial: GraphFormType<Partial<GraphV2>>= ({graphData, update, save})=>{
    const {tags} = useTagsContext()
    const tagsPair = tags.map(({id, name})=>({id, name}))

    const size = React.useContext(ResponsiveContext)
    const hasHorizontal = graphData.kind === GraphKind.bar || graphData.kind === GraphKind.line
    const graphEnabled = graphData.kind && graphData.group && (!hasHorizontal) || graphData.horizontalGroup
    return <Form 
        value={graphData}
        onChange={newValue => update(newValue)}
        onSubmit={async ()=>{
            await save()
        }}
    >
        <Box direction={size ==='small' ? 'column' : 'row'} width="fill">
            {graphEnabled ? <GraphViewer graph={enrichGraph(graphData as GraphV2, tags)}/> :<GraphPlaceholder />}
            <Box>
                <FormField name='name' htmlFor="text-input-name" label="Graph name">
                    <TextInput id='text-input-name' name='name' />
                </FormField>
                <FormField name='kind' htmlFor="select-kind" label='Graph kind'>
                    <Select id='select-kind' options={Object.values(GraphKind)} name='kind'/>
                </FormField>
                <FormField name='kind' htmlFor="select-kind" label='Graph kind'>
                    <Select id='select-kind' options={Object.values(GraphKind)} name='kind'/>
                </FormField>
                <FormField name='tag' htmlFor="select-for-tag-filter" label='Tag filter'>
                    <Select 
                        id='select-for-tag-filter' 
                        name="tagFilter" 
                        options={tagsPair}
                        labelKey="name"
                        valueKey={{key: 'id', reduce: true}}
                        />
                </FormField>
                <FormField>
                    <Select 
                        id='select-date-range' 
                        options={[]}
                        />
                </FormField>
                <FormField>
                    <CheckBox name='accumulate'/>
                </FormField>
            </Box>
        </Box>
    </Form>
}

export const GraphFormComplete = GraphFormPartial as GraphFormType<GraphV2>