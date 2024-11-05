import { instanceToPlain, plainToClass } from 'class-transformer';
import React from 'react';
import { useParams } from 'react-router';

import { Tag } from '../../../api/client/tag/types';
import { usePutTag } from '../../../api/client/tag/use-put-tag';
import { useTagsContext } from '../../common/tag.context';
import NotFound from '../../extra/not-found';
import { EditTagForm } from './edit-tag.form';
import { FiltersList } from './filters-list';
import { UITag } from './models/ui-tag.model';

export const TagEdit: React.FC = () => {
    const { tagsMap, refresh } = useTagsContext();
    const { id } = useParams<{ id: string }>();
    const idNum = Number.parseInt(id ?? 'Nan', 10);
    const tag: Tag | undefined = tagsMap.get(idNum);

    const [, updateTag] = usePutTag(tag?.id ?? 0);

    const [tagUiValue, setTagUiValue] = React.useState<UITag | undefined>();

    React.useEffect(() => {
        setTagUiValue(plainToClass(UITag, tag));
    }, [tag]);

    if (tagUiValue) {
        return (
            <React.Fragment>
                <EditTagForm
                    tag={tagUiValue}
                    save={async tagUi => {
                        await updateTag({ data: instanceToPlain(tagUi) });
                        await refresh();
                    }}
                />
                <FiltersList tagId={tagUiValue.id} />
            </React.Fragment>
        );
    }
    return <NotFound />;
};
