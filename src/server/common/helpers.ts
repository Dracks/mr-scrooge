import { Op } from 'sequelize';

export const sequelizeQueryOrIsNull = <T>(data?: T): T | { [Op.is]: null } => {
    if (data !== undefined) {
        return data;
    }
    return { [Op.is]: null };
};
