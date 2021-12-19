import React, { ChangeEventHandler, LegacyRef } from 'react'

import { Box, Keyboard, TextInput } from 'grommet'
import { ITagModel, Tag } from './tag'

interface TagInputProps {
    value: ITagModel[]
    onAdd: (a: ITagModel | { name: string }) => void
    onChange?: (e: unknown) => void
    onRemove: (a: ITagModel) => void
    suggestions?: ITagModel[]
}

export const InputTag: React.FC<TagInputProps> = ({
    value = [],
    onAdd,
    onChange,
    onRemove,
    suggestions,
    ...rest
}) => {
    const [currentTag, setCurrentTag] = React.useState('')
    const boxRef = React.useRef<HTMLDivElement>()

    const updateCurrentTag = (event: ChangeEventHandler<HTMLInputElement>) => {
        setCurrentTag(event.target.value)
        if (onChange) {
            onChange(event)
        }
    }

    const onAddTag = (tag: ITagModel | { name: string }) => {
        if (onAdd) {
            onAdd(tag)
        }
    }

    const onEnter = () => {
        if (currentTag.length) {
            onAddTag({ name: currentTag })
            setCurrentTag('')
        }
    }

    const renderValue = () =>
        value.map((v, index) => (
            <Tag key={`${v}${index + 0}`} onRemove={() => onRemove(v)}>
                {v.name}
            </Tag>
        ))

    return (
        <Keyboard onEnter={onEnter}>
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
                        suggestions={suggestions?.map(tag => ({label: tag.name, value: tag.name}))?? []}
                        onChange={updateCurrentTag as any}
                        value={currentTag}
                        onSuggestionSelect={(event) =>
                            onAddTag(event.suggestion)
                        }
                    />
                </Box>
            </Box>
        </Keyboard>
    )
}
