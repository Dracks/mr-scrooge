import { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UserGroupModel } from '../../session/models/group.model';
import { LabelModel } from './label.model';

export enum GraphKind {
    Bar = 'bar',
    Line = 'line',
    Pie = 'pie'
}

export enum GraphGroup {
    Day = 'day',
    Month = 'month',
    Sign = 'sign',
    Tags = 'tags',
    Year = 'year'
}

export type IGraphAttributes = InferAttributes<GraphModel>;

@Table({
    tableName: 'graph_graph',
    timestamps: false,
})
export class GraphModel extends Model<IGraphAttributes, InferCreationAttributes<GraphModel>> {
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        allowNull: false,
        field: 'group_owner_id',
        type: DataType.INTEGER,
    })
    @ForeignKey(() => UserGroupModel)
    groupOwnerId!: UserGroupModel['id'];

    @Column({
        type: DataType.STRING(255),
    })
    name!: string;

    @Column({
        type: DataType.CHAR(3),
        allowNull: false,
    })
    kind!: GraphKind;

    @Column({
        type: DataType.INTEGER,
        field: 'tag_filter',
    })
    @ForeignKey(() => LabelModel)
    tagFilter?: LabelModel['id'];

    @Column({
        type: DataType.STRING(255),
        field: 'date_range',
    })
    dateRange?: string;
}

export class AbstractGroupModel<A extends {}, C extends {}> extends Model<A, C> {
    @Column({
        autoIncrement: true,
        primaryKey: true,
        type: DataType.INTEGER,
    })
    id!: CreationOptional<number>;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    @ForeignKey(() => GraphModel)
    graphId!: GraphModel['id'];

    @Column({
        type: DataType.CHAR(10),
        values: Object.values(GraphGroup),
        allowNull: false,
    })
    group!: GraphGroup;

    @Column({
        type: DataType.BOOLEAN,
        field: 'hide_others',
    })
    hideOthers?: boolean;
}

@Table({
    tableName: 'graph_group',
    timestamps: false,
})
export class GraphGroupModel extends AbstractGroupModel<
    InferAttributes<GraphGroupModel>,
    InferCreationAttributes<GraphGroupModel>
> {}

@Table({
    tableName: 'graph_horizontal_group',
    timestamps: false,
})
export class GraphHorizontalGroupModel extends AbstractGroupModel<
    InferAttributes<GraphHorizontalGroupModel>,
    InferCreationAttributes<GraphHorizontalGroupModel>
> {
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    accumulate!: CreationOptional<boolean>;
}

@Table({
    tableName: 'graph_group_tags',
    timestamps: false,
})
export class GraphGroupTagsModel extends Model<
    InferAttributes<GraphGroupTagsModel>,
    InferCreationAttributes<GraphGroupTagsModel>
> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    @ForeignKey(() => GraphGroupModel)
    groupId!: GraphGroupModel['id'];

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    @ForeignKey(() => LabelModel)
    labelId!: LabelModel['id'];
}

@Table({
    tableName: 'graph_horizontal_group_tags',
    timestamps: false,
})
export class GraphHorizontalGroupTagsModel extends Model<
    InferAttributes<GraphHorizontalGroupTagsModel>,
    InferCreationAttributes<GraphGroupTagsModel>
> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    @ForeignKey(() => GraphHorizontalGroupModel)
    groupId!: GraphHorizontalGroupModel['id'];

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
    })
    @ForeignKey(() => LabelModel)
    labelId!: LabelModel['id'];
}
