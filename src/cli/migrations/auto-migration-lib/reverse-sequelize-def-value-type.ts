import { DefaultValue, InternalDefault, NotSupportedDefault } from './types';

export const reverseSequelizeDefValueType = (
    defaultValue: unknown,
    prefix = 'Sequelize.',
): InternalDefault | NotSupportedDefault | DefaultValue | undefined => {
    if (typeof defaultValue === 'object') {
        if (defaultValue && defaultValue.constructor && defaultValue.constructor.name) {
            const {name} = defaultValue.constructor;
            let value = prefix + name;
            if (name === 'Fn') {
                // FIXME the type cast
                value = `${prefix  }fn("${  (defaultValue as { fn: unknown }).fn  }")`;
            }
            return { internal: true, value };
        }
    }

    if (typeof defaultValue === 'function') return { notSupported: true, value: '' };

    return { value: defaultValue };
};
