create table product
(
--     id    UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    id   LONG AUTO_INCREMENT PRIMARY KEY,
    name  varchar(50),
    price decimal
);

CREATE TEMPORARY TABLE IF NOT EXISTS temp_product_names
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);