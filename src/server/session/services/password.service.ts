/* eslint-disable class-methods-use-this */
import { Injectable, Logger } from '@nestjs/common';
// import bcrypt from 'bcrypt';
import Bun from 'bun'
import { pbkdf2 } from 'node:crypto';

@Injectable()
export class PasswordService {
    private readonly logger = new Logger(this.constructor.name);

    validate(password: string, oldHash: string): Promise<boolean> {
        return Bun.password.verify(password, oldHash)//compare(password, oldHash);
    }

    hash(password: string): Promise<string> {
        return Bun.password.hash(password, {algorithm: 'bcrypt', cost: 10});
    }

    // https://docs.djangoproject.com/en/4.1/topics/auth/passwords/
    async validateDjango(password: string, oldHash: string): Promise<boolean> {
        const [algorithmComposed, iterations, salt, hash] = oldHash.split('$');
        const [algorithm, diggest] = algorithmComposed.split('_') ?? [];
        const hashBuffer = Buffer.from(hash, 'base64');
        if (algorithm === 'pbkdf2') {
            const newHash = await new Promise((resolve, reject) =>{
                pbkdf2(password, salt, Number.parseInt(iterations, 10), hashBuffer.length, diggest, (err, derivedKey) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(derivedKey.toString('base64'));
                    }
                })
            });
            // eslint-disable-next-line sort-keys
            this.logger.log({ algorithm, diggest, iterations, salt, hash, newHash }, 'Hashed using pbkdf2');
            return newHash === oldHash;
        }
        return false;
    }
}
