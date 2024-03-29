-- insert into product(name, price)
-- values ('product_A', 1.0);
-- insert into product(name, price)
-- values ('product_B', 2.0);
-- insert into product(name, price)
-- values ('product_C', 3.0);
-- insert into product(name, price)
-- values ('product_D', 4.0);

-- Create a temporary table for generating random product names
-- CREATE TEMPORARY TABLE IF NOT EXISTS temp_product_names (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255)
-- );

-- Generate a series of numbers using a recursive CTE
-- WITH RECURSIVE number_series(n) AS (
--     SELECT 1
--     UNION ALL
--     SELECT n + 1 FROM number_series WHERE n < 1000
-- )

-- Insert random product names into the temporary table
-- INSERT INTO temp_product_names (name)
-- SELECT 'Product_' || n AS name
-- FROM number_series;

-- Insert rows into the product table using random product names and prices
-- INSERT INTO product (name, price)
-- SELECT name, ROUND(RAND() * 1000, 2) AS price
-- FROM temp_product_names;

-- Clean up: drop the temporary table
-- DROP TABLE IF EXISTS temp_product_names;
