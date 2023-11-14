import { AbstractDataType, ModelAttributeColumnOptions, Sequelize } from 'sequelize';
import { DataType,Sequelize as TSequelize } from 'sequelize-typescript';

interface TypeOptions {
    binary?: boolean;
    decimals?: number;
    length?: string;
    precision?: number;
    scale?: number;
    srid?: string;
    type?: string;
    unsigned?: boolean;
    values?: string[];
    zerofill?: boolean;
}

export const reverseSequelizeColType = (
    col: ModelAttributeColumnOptions & { seqType: string },
    prefix = 'Sequelize.',
): string => {
    const attrName =
        typeof col.type === 'object' && 'key' in col.type && typeof col.type.key !== 'undefined'
            ? col.type.key
            : col.type;
    const attrObj = col.type;
    const options = (typeof col.type === 'object' && 'options' in col.type ? col.type.options : {}) as TypeOptions;

    switch (attrName) {
        // CHAR(length, binary)
        case DataType.CHAR.key:
            if (options.binary) return `${prefix  }CHAR.BINARY`;
            return `${prefix  }CHAR(${  options.length  })`;

        // STRING(length, binary).BINARY
        case DataType.STRING.key:
            return (
                `${prefix 
                }STRING${ 
                options.length ? `(${  options.length  })` : '' 
                }${options.binary ? '.BINARY' : ''}`
            );

        // TEXT(length)
        case DataType.TEXT.key:
            if (!options.length) return `${prefix  }TEXT`;
            return `${prefix  }TEXT(${  options.length.toLowerCase()  })`;

        // NUMBER(length, decimals).UNSIGNED.ZEROFILL
        case DataType.NUMBER.key:
        case DataType.TINYINT.key:
        case DataType.SMALLINT.key:
        case DataType.MEDIUMINT.key:
        case DataType.BIGINT.key:
        case DataType.FLOAT.key:
        case DataType.REAL.key:
        case DataType.DOUBLE.key:
        case DataType.DECIMAL.key:
        case DataType.INTEGER.key: {
            let retStr = attrName;
            if (retStr === 'DOUBLE PRECISION') {
                retStr = 'DOUBLE';
            }
            if (options.length) {
                retStr += `(${  options.length}`;
                if (options.decimals) retStr += `, ${  options.decimals}`;
                retStr += ')';
            }

            if (options.precision) {
                retStr += `(${  options.precision}`;
                if (options.scale) retStr += `, ${  options.scale}`;
                retStr += ')';
            }

            const ret = [retStr];

            if (options.zerofill) ret.push('ZEROFILL');

            if (options.unsigned) ret.push('UNSIGNED');

            return prefix + ret.join('.');
        }

        case DataType.ENUM.key:
            return `${prefix  }ENUM('${  options.values?.join("', '")  }')`;

        case DataType.BLOB.key:
            if (!options.length) return `${prefix  }BLOB`;
            return `${prefix  }BLOB("${  options.length.toLowerCase()  }")`;

        case DataType.ENUM.key:
            return `${prefix  }ENUM('${  options.values?.join("', '")  }')`;

        case DataType.GEOMETRY.key:
            if (options.type) {
                if (options.srid) return `${prefix  }GEOMETRY('${  options.type  }', ${  options.srid  })`;
                return `${prefix  }GEOMETRY('${  options.type  }')`;
            }
            return `${prefix  }GEOMETRY`;

        case DataType.GEOGRAPHY.key:
            return `${prefix  }GEOGRAPHY`;

        case DataType.ARRAY.key:
            const _type = (attrObj as AbstractDataType).toString({});
            let arrayType;
            if (_type === 'INTEGER[]' || _type === 'STRING[]') {
                arrayType = prefix + _type.replace('[]', '');
            } else {
                arrayType =
                    col.seqType === 'Sequelize.ARRAY(Sequelize.INTEGER)' ? `${prefix  }INTEGER` : `${prefix  }STRING`;
            }
            return `${prefix  }ARRAY(${arrayType})`;

        case DataType.RANGE.key:
            console.warn(`${attrName  } type not supported, you should make it by`);
            return prefix + (attrObj as AbstractDataType).toSql();
        /*
         * BOOLEAN
         * TIME
         * DATE
         * DATEONLY
         * HSTORE
         * JSONB
         * UUID
         * UUIDV1
         * UUIDV4
         * VIRTUAL
         * INET
         * MACADDR
         */
        default:
            return prefix + attrName;
    }
};
