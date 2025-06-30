import { Box, Tag, TextInput } from 'grommet';
import React, { ChangeEventHandler } from 'react';

export interface ILabelModel {
    id: string;
    name: string;
}

interface LabelInputProps<T extends ILabelModel> {
    onAdd: (a: T) => void;
    onChange?: (e: unknown) => void;
    onRemove: (a: T) => void;
    suggestions?: T[];
    value: T[];
}

export const LabelInput = <T extends ILabelModel>({
    value = [],
    onAdd,
    onChange,
    onRemove,
    suggestions,
    'data-testid': dataTestId,
    ...rest
}: LabelInputProps<T> & { 'data-testid'?: unknown }): React.ReactElement => {
    const [currentTag, setCurrentTag] = React.useState('');
    const boxRef = React.useRef<HTMLDivElement>(document.createElement('div'));

    const updateCurrentLabel: ChangeEventHandler<HTMLInputElement> = event => {
        setCurrentTag(event.target.value);
        if (onChange) {
            onChange(event);
        }
    };

    const onAddTag = (label: T) => {
        onAdd(label);
    };

    const renderValue = () =>
        value.map(v => (
            <Tag
                size="small"
                key={v.id}
                value={v.name}
                data-testid={`selector-tag-${v.id}`}
                onRemove={() => {
                    onRemove(v);
                }}
            />
        ));

    return (
        <Box
            direction="row"
            align="center"
            pad={{ horizontal: 'xsmall' }}
            border="all"
            ref={(ref: HTMLDivElement) => {
                boxRef.current = ref;
            }}
            wrap
            data-testid={dataTestId}
        >
            {value.length > 0 && renderValue()}
            <Box flex style={{ minWidth: '120px' }}>
                <TextInput
                    type="search"
                    plain
                    dropTarget={boxRef.current}
                    {...rest}
                    suggestions={
                        suggestions
                            ?.filter(tag => tag.name.toLowerCase().includes(currentTag.toLowerCase()))
                            .map(tag => ({
                                label: tag.name,
                                value: tag.id,
                            })) ?? []
                    }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        updateCurrentLabel(event);
                    }}
                    value={currentTag}
                    onSuggestionSelect={event => {
                        const { value: suggestionId } = event.suggestion as { value: string };
                        const suggestion = suggestions?.find(test => test.id === suggestionId);
                        if (suggestion) {
                            onAddTag(suggestion);
                        }
                        setCurrentTag('');
                    }}
                />
            </Box>
        </Box>
    );
};
