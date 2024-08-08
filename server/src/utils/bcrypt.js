//util to change password to hash if needs

import bcrypt from 'bcrypt';

const encrypt = async (password) => {
    const hash = bcrypt.hash(password, 12);
    return hash;
}

console.log(await encrypt('123456'));