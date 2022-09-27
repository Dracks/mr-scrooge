import { Box, TextInput } from 'grommet';
import React, { ChangeEventHandler, LegacyRef } from 'react';

import { ITagModel, Tag } from './tag';

interface TagInputProps {
    onAdd: (a: ITagModel) => void;
    onChange?: (e: unknown) => void;
    onRemove: (a: ITagModel) => void;
    suggestions?: ITagModel[];
    value: ITagModel[];
}

export const InputTag: React.FC<TagInputProps> = ({ value = [], onAdd, onChange, onRemove, suggestions, ...rest }) => {
    const [currentTag, setCurrentTag] = React.useState('');
    const boxRef = React.useRef<HTMLDivElement>();

    const updateCurrentTag = (
        event: ChangeEventHandler<HTMLInputElement> & {
            target: { value: string };
        },
    ) => {
        setCurrentTag(event.target.value);
        if (onChange) {
            onChange(event);
        }
    };

    const onAddTag = (tag: ITagModel) => {
        if (onAdd) {
            onAdd(tag);
        }
    };

    const renderValue = () =>
        value.map((v, index) => (
            <Tag key={`${v}${index + 0}`} onRemove={() => onRemove(v)}>
                {v.name}
            </Tag>
        ));

    return (
        <Box
            direction="row"
            align="center"
            pad={{ horizontal: 'xsmall' }}
            border="all"
            ref={boxRef as LegacyRef<HTMLDivElement>}
            wrap
        >
            {value.length > 0 && renderValue()}
            <Box flex style={{ minWidth: '120px' }}>
                <TextInput
                    type="search"
                    plain
                    dropTarget={boxRef.current!}
                    {...rest}
                    suggestions={
                        suggestions
                            ?.filter(tag => tag.name.toLowerCase().includes(currentTag.toLowerCase()))
                            .map(tag => ({
                                label: tag.name,
                                value: tag.id,
                            })) ?? []
                    }
                    onChange={updateCurrentTag as any}
                    value={currentTag}
                    onSuggestionSelect={event => {
                        const { value, label }: { label: string; value: number } = event.suggestion;
                        onAddTag({ id: value, name: label });
                    }}
                />
            </Box>
        </Box>
    );
};
