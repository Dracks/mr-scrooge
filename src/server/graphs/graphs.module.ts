import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import {
    GraphGroupLabelsModel,
    GraphGroupModel,
    GraphHorizontalGroupLabelsModel,
    GraphHorizontalGroupModel,
    GraphModel,
} from './models/graph.model';
import { LabelModel,LabelTransactionModel } from './models/label.model';
import { GraphResolver } from './resolvers/graph.resolver';
import { LabelResolver } from './resolvers/label.resolver';
import { GraphService } from './services/graph.service';
import { LabelService } from './services/label.service';

@Module({
    imports: [
        SequelizeModule.forFeature([
            LabelModel,
            LabelTransactionModel,
            GraphModel,
            GraphGroupModel,
            GraphHorizontalGroupModel,
            GraphGroupLabelsModel,
            GraphHorizontalGroupLabelsModel,
        ]),
    ],
    providers: [GraphService, LabelService, LabelResolver, GraphResolver],
    exports: [GraphService, LabelService],
})
export class GraphsModule {}
