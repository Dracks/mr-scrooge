import { Op } from "sequelize"
import { WhereOptions } from "sequelize"

export const queryOwnerId = (groupsId: number[]): WhereOptions<{groupOwnerId: number}>=> ({
    groupOwnerId: {[Op.in]: groupsId}
})