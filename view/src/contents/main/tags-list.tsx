import { Box, Button } from 'grommet';
import React from 'react';

import { useGetAvailableTagsQuery } from '../../graphql/generated';
import { LoadingPage } from '../../utils/ui/loading';
import { ITagModel, Tag } from '../../utils/ui/tag/tag';

interface TagsListProps {
    onFilterChange: (tags: ITagModel[]) => void;
}
export const TagsList: React.FC<TagsListProps> = ({ onFilterChange }) => {
    const [tagsQuery] = useGetAvailableTagsQuery();
    const [filters, setFilters] = React.useState<ITagModel[]>([]);
    if (tagsQuery.fetching) {
        return <LoadingPage />;
    } else if (tagsQuery.data) {
        return (
            <Box>
                {tagsQuery.data.listTags.map(tag => (
                    <Button
                        onClick={() => {
                            const pos = filters.indexOf(tag);
                            if (pos >= 0) {
                                filters.splice(pos, 1);
                            } else {
                                filters.push(tag);
                            }
                            onFilterChange(filters), setFilters(filters);
                        }}
                    >
                        <Tag>{tag.name}</Tag>
                    </Button>
                ))}
            </Box>
        );
    }
    return <div> Some Error </div>;
};
