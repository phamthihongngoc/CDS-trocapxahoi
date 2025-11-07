import bcrypt from 'bcryptjs';

const password = '123456';
const hash = '$2b$10$aPYaP1yTu7s19Nfp1CCHruiv0F7EAybHC4ts2NZMGTlabShYOz82e';

console.log('Testing bcrypt...');
console.log('Password:', password);
console.log('Hash:', hash);

const isValid = await bcrypt.compare(password, hash);
console.log('Is valid?', isValid);

process.exit(0);
