const pool = require('./config/database');

async function seed() {
    try {
        await pool.query(`TRUNCATE coupons CASCADE`);
        console.log('Todos os cupons removidos.');

        const coupons = [
            { code: 'LUMEPROMO10', value: 10.00 },
            { code: 'LUMEPROMO20', value: 20.00 },
            { code: 'LUMEPROMO30', value: 30.00 },
        ];

        for (const c of coupons) {
            await pool.query(`
                INSERT INTO coupons (code, type, value, is_used, expires_at)
                VALUES ($1, 'promocional', $2, false, '2027-01-01 00:00:00')
            `, [c.code, c.value]);
            console.log(`Cupom ${c.code} criado!`);
        }


        process.exit(0);
    } catch (err) {
        console.error('Erro:', err);
        process.exit(1);
    }
}

seed();
