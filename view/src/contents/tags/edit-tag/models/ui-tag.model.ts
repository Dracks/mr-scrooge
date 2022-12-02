import { Transform } from 'class-transformer';

import { Tag } from '../../../../api/client/tag/types';

export class UITag implements Omit<Tag, 'negateConditional' | 'parent'> {
    id!: number;

    children!: number[];

    name!: string;

    filters!: number[];

    @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
    parent?: number;

    @Transform(({ value }) => (value ? 1 : 0), { toClassOnly: true })
    @Transform(({ value }) => value === 1, { toPlainOnly: true })
    negateConditional!: number;
}
