import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import {
    GraphGroupModel,
    GraphGroupTagsModel,
    GraphHorizontalGroupModel,
    GraphHorizontalGroupTagsModel,
    GraphModel,
} from './models/graph.model';
import { LabelModel,LabelTransactionModel } from './models/label.model';
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
            GraphGroupTagsModel,
            GraphHorizontalGroupTagsModel,
        ]),
    ],
    providers: [GraphService, LabelService, LabelResolver],
    exports: [GraphService, LabelService],
})
export class GraphsModule {}
