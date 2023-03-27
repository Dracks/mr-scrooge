/* eslint-disable no-use-before-define */
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
    // Note this needs to be transformed from old tags
    Labels = 'labels',
    Month = 'month',
    Sign = 'sign',
    Year = 'year'
}

export enum GraphDateRange {
    all = 'all',
    halfYear = 'six',
    oneMonth = 'month',
    oneYear = 'year',
    sixYears = 'sixYears',
    twoYears = 'twoYears',
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
    labelFilter?: LabelModel['id'];

    @Column({
        type: DataType.CHAR(10),
        field: 'date_range',
        values: Object.values(GraphDateRange),
        allowNull: false,
    })
    dateRange!: GraphDateRange;
}

export class AbstractGroupModel<A extends object, C extends object> extends Model<A, C> {
    @Column({
        allowNull: false,
        field: 'graph_id',
        primaryKey: true,
        type: DataType.INTEGER,
        unique: true,
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
    tableName: 'graph_group_labels',
    timestamps: false,
})
export class GraphGroupLabelsModel extends Model<
    InferAttributes<GraphGroupLabelsModel>,
    InferCreationAttributes<GraphGroupLabelsModel>
> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        field: 'graph_id',
    })
    @ForeignKey(() => GraphGroupModel)
    graphId!: GraphGroupModel['graphId'];

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        field: 'label_id',
    })
    @ForeignKey(() => LabelModel)
    labelId!: LabelModel['id'];
}

@Table({
    tableName: 'graph_horizontal_group_labels',
    timestamps: false,
})
export class GraphHorizontalGroupLabelsModel extends Model<
    InferAttributes<GraphHorizontalGroupLabelsModel>,
    InferCreationAttributes<GraphGroupLabelsModel>
> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        field: 'graph_id'
    })
    @ForeignKey(() => GraphHorizontalGroupModel)
    graphId!: GraphHorizontalGroupModel['graphId'];

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        field: 'label_id'
    })
    @ForeignKey(() => LabelModel)
    labelId!: LabelModel['id'];
}
