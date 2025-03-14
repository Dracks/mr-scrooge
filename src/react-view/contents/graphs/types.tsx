import { GraphInput, Group, HorizontalGroup, Label } from '../../api/models';

export type EnrichedGroup<T extends Group> = Omit<T, 'labels'> & {
    labels?: Label[];
};

export type EnrichedGraph<T extends GraphInput> = Omit<T, 'group' | 'horizontalGroup'> & {
    group: EnrichedGroup<Group>;
    horizontalGroup?: EnrichedGroup<HorizontalGroup>;
};
