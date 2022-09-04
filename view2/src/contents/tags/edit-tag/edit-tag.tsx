import { instanceToPlain, plainToClass, Transform } from "class-transformer"
import { Box, Button, Form, FormField, Grid, Select, TextInput } from "grommet"
import React from "react"
import { useParams } from 'react-router'
import { Tag } from "../../../api/client/tag/types"
import { usePutTag } from "../../../api/client/tag/use-put-tag"
import { useTagsContext } from "../../common/tag.context"
import NotFound from "../../extra/not-found"
import { FiltersList } from "./filters-list"

class UITag implements Omit<Tag, 'negateConditional' | 'parent'> {
    id!: number;

    children!: number[]

    name!: string

    filters!: number[]

    @Transform(({value})=>value ? value : -1, {toClassOnly: true})
    @Transform(({value})=>  value === -1 ? null : value, {toPlainOnly: true})
    parent!:  number

    @Transform(({value})=> value ? 1 : 0, {toClassOnly: true})
    @Transform(({value})=> value === 1, {toPlainOnly: true})
    negateConditional!: number
}
type SelectTagOption = Pick<UITag, 'id' | 'name'>

const NO_PARENT_SELECTED : SelectTagOption = {
    id: -1, 
    name: 'No parent',
}


export const TagEdit: React.FC = () => {
    const { tagsMap, tags, refresh } = useTagsContext()
    const { id } = useParams<{ id: string }>()
    const tag: Tag | undefined = tagsMap[Number.parseInt(id ?? "Nan", 10)]
    
    const [, request] = usePutTag(tag?.id)
    
    const [tagUiValue, setTagUiValue] = React.useState<UITag | undefined>()

    React.useEffect(()=>{
        setTagUiValue(plainToClass(UITag, tag))
    }, [tag])

    const possibleParents = React.useMemo<SelectTagOption[]>(()=>{
        const tmpChildrenList = [...tag.children]
        const childrenList = [tag.id]
        while (tmpChildrenList.length>0){
            const firstChildId = tmpChildrenList.pop() as number;
            childrenList.push(firstChildId)
            const firstChild = tagsMap[firstChildId]
            firstChild.children.forEach(child => tmpChildrenList.push(child));
        }
        return [NO_PARENT_SELECTED, ...tags.filter(({id})=> !childrenList.includes(id)).map(({id, name})=>({id, name}))]
    }, [tag, tag?.parent, tagsMap, tags])


    if (tagUiValue) {
        return <React.Fragment>
                <Form
                value={tagUiValue}
                // We need the Object.assign to preserve the metadata of the class-transformer
                onChange={nextValue => setTagUiValue(Object.assign(tagUiValue,nextValue))}
                onSubmit={async ({ value }) => {
                    // console.log('onSubmit', instanceToPlain(value, {version: 1}))
                    await request({
                        data: {
                            // Not tested...
                            ...instanceToPlain(value)
                        }
                    })
                    refresh()
                }}>
                <Grid columns="medium" gap="small">
                    <FormField name="name" htmlFor="text-input-name" label="Name">
                        <TextInput id="text-input-name" name="name" />
                    </FormField>
                    <FormField name="parent" htmlFor="select-parent" label="Parent">
                        <Select 
                        options={possibleParents} 
                        id='select-parent' 
                        name='parent' 
                        labelKey="name"
                        valueKey={{ key: 'id', reduce: true }}
                    />
                    </FormField>
                    <FormField name="negateConditional" htmlFor="negate-conditional" label="Management of conditions">
                        <Select 
                            name='negateConditional'
                            id='negate-conditional'
                            options={[
                                "cond1 or cond2 ...",
                                "not cond1 and not cond2 ..."
                            ].map((value, key)=>({key, value}))} 
                            labelKey="value"
                            valueKey={{ key: 'key', reduce: true }}
                        />
                    </FormField>
                    <Box direction="row" gap="medium" align="center" justify="center">
                        <Button type="submit" primary label="Save" />
                        <Button type="reset" label="Reset" />
                    </Box>
                </Grid>
            </Form>
            <FiltersList tagId={tagUiValue.id}/>
            </React.Fragment>
    } else {
        return <NotFound />
    }
}
