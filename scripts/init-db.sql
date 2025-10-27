-- Script de inicialización de base de datos para Marcas Service
-- Este script se ejecuta automáticamente al crear el contenedor PostgreSQL

-- Crear base de datos si no existe (esto se maneja automáticamente por POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS marcas_api;

-- Crear tabla de marcas (ejemplo básico)
CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    id_guia INTEGER NOT NULL,
    motivo_marca VARCHAR(50) NOT NULL,
    observacion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_marcas_id_guia ON marcas(id_guia);
CREATE INDEX IF NOT EXISTS idx_marcas_activa ON marcas(activa);
CREATE INDEX IF NOT EXISTS idx_marcas_fecha_creacion ON marcas(fecha_creacion);

-- Insertar datos de ejemplo (opcional)
INSERT INTO marcas (id_guia, motivo_marca, observacion) VALUES
(12345, 'F', 'Revisión manual requerida'),
(12346, 'D', 'Documentación incompleta'),
(12347, 'E', 'Error en clasificación')
ON CONFLICT DO NOTHING;

-- Crear función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS update_marcas_updated_at ON marcas;
CREATE TRIGGER update_marcas_updated_at
    BEFORE UPDATE ON marcas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Marcas Service inicializada correctamente';
END $$;
