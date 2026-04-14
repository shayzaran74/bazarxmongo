-- infra/scripts/init-databases.sql

-- Core Backend Veritabanı
CREATE DATABASE barterborsa_core;

-- Financial Service Veritabanı
CREATE DATABASE barterborsa_financial;

-- Yetkilendirme (PostgreSQL container'ı başladığında POSTGRES_USER ile çalışır)
GRANT ALL PRIVILEGES ON DATABASE barterborsa_core TO barterborsa;
GRANT ALL PRIVILEGES ON DATABASE barterborsa_financial TO barterborsa;
