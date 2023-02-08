import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GraphGroupModel, GraphGroupTagsModel, GraphHorizontalGroupModel, GraphHorizontalGroupTagsModel, GraphModel } from "./models/graph.model";
import { LabelTransactionModel, LabelModel } from "./models/label.model";
import { GraphService } from "./services/graph.service";
import { LabelService } from "./services/label.service";

@Module({
    imports: [
        SequelizeModule.forFeature([LabelModel, LabelTransactionModel,GraphModel, GraphGroupModel, GraphHorizontalGroupModel, GraphGroupTagsModel, GraphHorizontalGroupTagsModel])
    ],
    providers: [GraphService, LabelService],
    exports: [GraphService, LabelService]
})
export class GraphsModule {}