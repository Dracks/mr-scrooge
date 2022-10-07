import { Box, Button, Form, FormField, Grid, Select, TextInput } from 'grommet';
import React from 'react';

import { useTagsContext } from '../../common/tag.context';
import { UITag } from './models/ui-tag.model';

interface EditTagFormProps {
    save: (tag: UITag) => Promise<void>;
    tag: UITag;
}

type SelectTagOption = Pick<UITag, 'id' | 'name'>;

export const EditTagForm: React.FC<EditTagFormProps> = ({ tag, save }) => {
    const { tagsMap, tags } = useTagsContext();
    const [tagUiValue, setTagUiValue] = React.useState<UITag>(tag);
    const possibleParents = React.useMemo<SelectTagOption[]>(() => {
        const tmpChildrenList = [...tag.children];
        const childrenList = [tag.id];
        while (tmpChildrenList.length > 0) {
            const firstChildId = tmpChildrenList.pop() as number;
            childrenList.push(firstChildId);
            const firstChild = tagsMap[firstChildId];
            firstChild.children.forEach(child => tmpChildrenList.push(child));
        }
        return tags.filter(({ id }) => !childrenList.includes(id)).map(({ id, name }) => ({ id, name }));
    }, [tag, tag?.parent, tagsMap, tags]);

    return (
        <Form<UITag>
            value={tagUiValue}
            // We need the Object.assign to preserve the metadata of the class-transformer
            onChange={nextValue => setTagUiValue(Object.assign(tagUiValue, nextValue))}
            onSubmit={() => save(tagUiValue)}
        >
            <Grid columns="medium" gap="small">
                <FormField name="name" label="Name" component={TextInput} />
                <FormField name="parent" htmlFor="select-parent" label="Parent">
                    <Select
                        options={possibleParents}
                        placeholder="Select parent"
                        id="select-parent"
                        name="parent"
                        labelKey="name"
                        valueKey={{ key: 'id', reduce: true }}
                        clear={{ label: 'Without parent' }}
                    />
                </FormField>
                <FormField name="negateConditional" htmlFor="negate-conditional" label="Management of conditions">
                    <Select
                        name="negateConditional"
                        id="negate-conditional"
                        options={['cond1 or cond2 ...', 'not cond1 and not cond2 ...'].map((value, key) => ({
                            key,
                            value,
                        }))}
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
    );
};
