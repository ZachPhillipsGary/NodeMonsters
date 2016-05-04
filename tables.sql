CREATE TABLE auth
(
uniqueID int NOT NULL AUTO_INCREMENT,
email varchar(955) NOT NULL,
password varchar(255),
PRIMARY KEY (uniqueID)
)
CREATE TABLE status
(
id int NOT NULL AUTO_INCREMENT,
health int NOT NULL,
damage int,
PRIMARY KEY (id)
)