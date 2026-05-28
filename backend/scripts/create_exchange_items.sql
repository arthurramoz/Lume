CREATE TABLE IF NOT EXISTS exchange_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    order_item_id INTEGER NOT NULL REFERENCES order_items(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
