
-- PFRE Project Master and Property Relationship
-- Creates project-related tables without deleting existing records.
-- Run only after the application code has been updated and reviewed.

BEGIN;

-- 1. Main project record
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  project_type VARCHAR(20) NOT NULL
    CHECK (project_type IN ('residential', 'commercial', 'mixed')),
  property_types TEXT[] NOT NULL DEFAULT '{}',

  developer_name VARCHAR(255),
  project_status VARCHAR(32) NOT NULL DEFAULT 'unknown',

  project_rera_id VARCHAR(100),
  society_formed BOOLEAN NOT NULL DEFAULT FALSE,
  society_name VARCHAR(255),
  default_building_name VARCHAR(255),

  road VARCHAR(255),
  locality VARCHAR(128),
  area_name VARCHAR(128),
  city VARCHAR(128) NOT NULL DEFAULT 'Mumbai',
  district VARCHAR(128),
  state VARCHAR(128) NOT NULL DEFAULT 'Maharashtra',
  country VARCHAR(128) NOT NULL DEFAULT 'India',
  police_station VARCHAR(255),
  post_office VARCHAR(255),
  postal_code VARCHAR(20),
  landmark TEXT,
  full_address TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),

  land_area NUMERIC(14, 2),
  land_area_unit VARCHAR(20),
  description TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS projects_name_idx
  ON projects (name);

CREATE INDEX IF NOT EXISTS projects_locality_idx
  ON projects (locality);

CREATE INDEX IF NOT EXISTS projects_type_idx
  ON projects (project_type);


-- 2. Multiple configurations per project:
-- e.g. 1 BHK, 2 BHK, shop, office or other unit types.
CREATE TABLE IF NOT EXISTS project_configurations (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL
    REFERENCES projects(id) ON DELETE RESTRICT,

  configuration_name VARCHAR(150) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  bhk INTEGER CHECK (bhk IS NULL OR bhk BETWEEN 0 AND 20),

  carpet_area NUMERIC(12, 2),
  built_up_area NUMERIC(12, 2),
  super_built_up_area NUMERIC(12, 2),
  rera_carpet_area NUMERIC(12, 2),
  mofa_carpet_area NUMERIC(12, 2),
  usable_carpet_area NUMERIC(12, 2),
  area_unit VARCHAR(20) NOT NULL DEFAULT 'sq ft',

  bathrooms INTEGER,
  balconies INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (project_id, id)
);

CREATE INDEX IF NOT EXISTS project_configurations_project_idx
  ON project_configurations (project_id);


-- 3. Nearby railway stations, metro stations, schools,
-- colleges, hospitals, landmarks and other facilities.
CREATE TABLE IF NOT EXISTS project_nearby_places (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL
    REFERENCES projects(id) ON DELETE RESTRICT,

  category VARCHAR(50) NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  distance_value NUMERIC(10, 2),
  distance_unit VARCHAR(20) DEFAULT 'km',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS project_nearby_places_project_idx
  ON project_nearby_places (project_id);


-- 4. Multiple land references per project:
-- Survey numbers, Hissa numbers, CTS numbers and plot numbers.
CREATE TABLE IF NOT EXISTS project_land_references (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL
    REFERENCES projects(id) ON DELETE RESTRICT,

  reference_type VARCHAR(50) NOT NULL,
  reference_number VARCHAR(150) NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS project_land_references_project_idx
  ON project_land_references (project_id);


-- 5. Link each property to zero or one project.
-- Existing property records are preserved.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS project_id VARCHAR(64);

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS project_configuration_id VARCHAR(64);

-- Add the project relationship only if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'properties_project_id_fk'
      AND conrelid = 'properties'::regclass
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_project_id_fk
      FOREIGN KEY (project_id)
      REFERENCES projects(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- Ensure a selected configuration belongs to the same project
-- selected by the property.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'properties_project_configuration_fk'
      AND conrelid = 'properties'::regclass
  ) THEN
    ALTER TABLE properties
      ADD CONSTRAINT properties_project_configuration_fk
      FOREIGN KEY (project_id, project_configuration_id)
      REFERENCES project_configurations(project_id, id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS properties_project_id_idx
  ON properties (project_id);

CREATE INDEX IF NOT EXISTS properties_project_configuration_idx
  ON properties (project_configuration_id);

COMMIT;
