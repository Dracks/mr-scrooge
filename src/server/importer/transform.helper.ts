import { BankTransactionBase } from "../bank-transaction/models/bank-transaction.model";
import { Exception } from "../core/errors/exception";
;

type FieldsMap<T> = Map<keyof BankTransactionBase, T>
const mandatoryFields : (keyof BankTransactionBase)[] = ['movementName', 'date', 'value']

export class TransformHelper<T extends number | string> {
    constructor(private mapping: FieldsMap<T>){
        const missingMandatoryFields = mandatoryFields.filter(field => !mapping.has(field))
        if (missingMandatoryFields.length>0){
            throw new Exception("E10004", "TransformHelper was created with missing fields in the mapping", {missingMandatoryFields})
        }
    }

    map(row: Record<T, unknown>): BankTransactionBase {
        const result: Partial<BankTransactionBase> = {};

        this.mapping.forEach((index, key) => {
            result[key] = row[index];
        });

        return result as BankTransactionBase;
    }
}
