const pool = require("../../config/database");

class AddressDao {
    //[Create]
    async create(address) {
        const query = `
        INSERT INTO addresses (
            user_id, alias, residence_type, street_type, street_name, 
            street_number, neighborhood, zip_code, city, state, country, 
            observations, is_billing, is_delivery
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
        `;

        const values = [
            address.user_id,
            address.alias,
            address.residence_type,
            address.street_type,
            address.street_name,
            address.street_number,
            address.neighborhood,
            address.zip_code,
            address.city,
            address.state,
            address.country,
            address.observations,
            address.is_billing || false,
            address.is_delivery || false,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll() {
        const query = `SELECT * FROM addresses`;
        const result = await pool.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = "SELECT * FROM addresses WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
    
    async update(id, address) {
    const query = `
        UPDATE addresses 
        SET 
            residence_type = $1, 
            street_type = $2, 
            street_name = $3, 
            street_number = $4, 
            neighborhood = $5, 
            zip_code = $6, 
            city = $7, 
            state = $8, 
            country = $9, 
            observations = $10, 
            is_billing = $11, 
            is_delivery = $12
        WHERE id = $13 
        RETURNING *;
        `;
    
        const values = [
            address.residence_type,
            address.street_type,
            address.street_name,
            address.street_number,
            address.neighborhood,
            address.zip_code,
            address.city,
            address.state,
            address.country,
            address.observations,
            address.is_billing || false,
            address.is_delivery || false,
            id // O ID do endereço vai aqui no final, que é o $13
        ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

    // [DELETE]
    async delete(id) {
        const query = "DELETE FROM addresses WHERE id = $1 RETURNING *";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new AddressDao();
