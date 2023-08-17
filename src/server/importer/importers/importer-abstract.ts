
import {FileParsedRow, FileParser, StatusReport} from './types';
import { BankTransaction, IBankTransaction } from '../../bank-transaction/models/bank-transaction.model'
import {StatusReportRow} from '../models/status-report-row-import'

export type FieldsMapper = Map<keyof IBankTransaction, number | string > 

export abstract class AbstractImporter {
  key = 'abstract';
  file_regex = null;

  sourceFile : FileParser
  status : StatusReport

  abstract _mapping: FieldsMapper;

  abstract _creator(filePath: string): FileParser;


  constructor(fileName: string, filePath: string, key?: string) {
    if (this.key === 'abstract') {
      throw new Error('Cannot instantiate abstract class');
    }

    const status : StatusReport = {
      kind: this.key,
      status: 'OK',
      fileName,
    }

    this.status = status;
    this.sourceFile = this._creator(filePath);
    if (key !== undefined) {
      this.key = key;
    }

    status.save();
  }

  build(data: FileParsedRow): BankTransaction {
    const newSource : Partial<BankTransaction> = {};
    newSource.kind = this.key;
    for (const pair of this._mapping.entries()) {
      const [key, index] = pair
      // TODO fix any
      newSource[key] = data[index] as any;
    }

    return newSource as BankTransaction;
  }

  addError(source: BankTransaction, message: string) {
    const status = this.generate_status(source);
    status.message = message;
    status.save();
  }

  generate_status(source: BankTransaction) {
    const status : StatusReportRow = {
      movementName: source.movementName,
      date: source.date,
      dateValue: source.dateValue,
      details: source.details,
      value: source.value,
    };
    status.report = this.status;
    return status;
  }

/*
  this should be a cqrs event
  apply_filters() {
    const root_list = Tag.objects.filter({ parent: null });
    for (const movement of this.movements) {
      const tags_to_filter = root_list.slice();
      while (tags_to_filter.length > 0) {
        const tag = tags_to_filter.pop();
        if (tag.apply_filters_source(movement)) {
          tags_to_filter.push(...tag.children.all());
        }
      }
    }
  }
  */

  run() {
    let status = this.status;
    const movements : BankTransaction[] = [];

    try {
      let previous :BankTransaction | null = null;
      let previous_status : StatusReportRow | null = null;
      let discarding = true;

      for (const row of this.sourceFile) {
        const source = this.build(row);

        if (source) {
          const status_row = this.generate_status(source);

          const repe_number = RawDataSource.objects.filter({
            kind: source.kind,
            movement_name: source.movement_name,
            date: source.date,
            details: source.details,
            value: source.value
          }).count();

          if (repe_number === 0) {
            if (previous !== null && previous_status) {
              previous.save();
              movements.push(source);

              previous_status.message = "Repeated row, but inserted";
              previous_status.bankTransactionId = previous.id;
              previous_status.save();
              previous = null;
            }
            discarding = false;
            source.save();
            status_row.bankTransactionId = source.id;
            status_row.save();
            movements.push(source);
          } else {
            if (!discarding) {
              previous = source;
              previous_status = status_row;
              discarding = true;
            } else {
              status.setWarning();
              const text = "repeated row, not inserted";

              if (previous !== null && previous_status !== null) {
                previous_status.message = text;
                previous_status.save();
                previous = null;
              }

              status_row.message = text;
              status_row.save();
            }
          }
        }
      }
    } catch (e) {
      status.description = e.stack;
      status.status = IMPORT_STATUS.ERROR;
      status.save();
    }
  }
}
