import { Op, WhereOptions } from 'sequelize';

export const queryOwnerId = (groupsId: number[]): WhereOptions<{ groupOwnerId: number }> => ({
    groupOwnerId: { [Op.in]: groupsId },
});
