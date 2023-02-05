import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { pbkdf2 } from 'node:crypto';

@Injectable()
export class PasswordService {
    private readonly logger = new Logger(this.constructor.name);

    async validate(password: string, oldHash: string): Promise<boolean> {
        this.logger.debug({ password, oldHash }, 'validating password');
        return await bcrypt.compare(password, oldHash);
    }

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    // https://docs.djangoproject.com/en/4.1/topics/auth/passwords/
    async validateDjango(password: string, oldHash: string): Promise<boolean> {
        const [algorithmComposed, iterations, salt, hash] = oldHash.split('$');
        const [algorithm, diggest] = algorithmComposed.split('_') ?? [];
        const hashBuffer = Buffer.from(hash, 'base64');
        if (algorithm === 'pbkdf2') {
            const newHash = await new Promise((resolve, reject) =>
                pbkdf2(password, salt, Number.parseInt(iterations), hashBuffer.length, diggest, (err, derivedKey) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(derivedKey.toString('base64'));
                    }
                }),
            );
            this.logger.log({ algorithm, diggest, iterations, salt, hash, newHash }, 'Hashed using pbkdf2');
            return newHash === oldHash;
        }
        return false;
    }
}