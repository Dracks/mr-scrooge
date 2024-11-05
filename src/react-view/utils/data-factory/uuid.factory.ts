import { ApiUUID } from '../../api/models';

export function generateUUID(id: number, prefix: string): ApiUUID {
    return `${prefix}-0000-${id}}`;
}
