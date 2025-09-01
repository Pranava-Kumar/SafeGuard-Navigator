-- PostgreSQL Migration for SafeRoute
-- Migration name: postgresql_migration

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial columns to relevant tables
ALTER TABLE "safety_reports" ADD COLUMN IF NOT EXISTS "location_geom" GEOMETRY(Point, 4326);
ALTER TABLE "routes" ADD COLUMN IF NOT EXISTS "path_geom" GEOMETRY(LineString, 4326);
ALTER TABLE "dark_spots" ADD COLUMN IF NOT EXISTS "area_geom" GEOMETRY(Polygon, 4326);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS "safety_reports_location_geom_idx" ON "safety_reports" USING GIST ("location_geom");
CREATE INDEX IF NOT EXISTS "routes_path_geom_idx" ON "routes" USING GIST ("path_geom");
CREATE INDEX IF NOT EXISTS "dark_spots_area_geom_idx" ON "dark_spots" USING GIST ("area_geom");

-- Add PostgreSQL-specific types and enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE "user_type" AS ENUM ('pedestrian', 'two_wheeler', 'cyclist', 'public_transport');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "user_role" AS ENUM ('user', 'premium', 'admin', 'trusted_reporter', 'civic_partner', 'super_admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_sharing_level') THEN
        CREATE TYPE "location_sharing_level" AS ENUM ('precise', 'coarse', 'city_only');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_preference') THEN
        CREATE TYPE "time_preference" AS ENUM ('safety_first', 'balanced', 'time_first');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_standing') THEN
        CREATE TYPE "community_standing" AS ENUM ('new', 'trusted', 'verified', 'expert');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
        CREATE TYPE "report_type" AS ENUM ('safety_hazard', 'lighting_issue', 'infrastructure', 'incident', 'positive_feedback');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_category') THEN
        CREATE TYPE "report_category" AS ENUM ('pothole', 'poor_lighting', 'harassment', 'theft', 'accident', 'construction');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE "report_status" AS ENUM ('pending', 'verified', 'rejected', 'resolved');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weather_condition') THEN
        CREATE TYPE "weather_condition" AS ENUM ('clear', 'cloudy', 'rain', 'storm', 'fog', 'snow');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_of_day') THEN
        CREATE TYPE "time_of_day" AS ENUM ('morning', 'afternoon', 'evening', 'night');
    END IF;
END $$;

-- Create functions for safety score calculations
CREATE OR REPLACE FUNCTION calculate_safety_score(
    lighting_score FLOAT,
    footfall_score FLOAT,
    hazard_score FLOAT,
    proximity_score FLOAT
) RETURNS FLOAT AS $$
BEGIN
    RETURN (
        0.30 * lighting_score +
        0.25 * footfall_score +
        0.20 * (100 - hazard_score) +
        0.25 * proximity_score
    );
END;
$$ LANGUAGE plpgsql;

-- Create function for Wilson score calculation (for reputation system)
CREATE OR REPLACE FUNCTION calculate_wilson_score(
    positive INT,
    total INT
) RETURNS FLOAT AS $$
DECLARE
    z FLOAT := 1.96; -- 95% confidence
    p FLOAT;
    denominator FLOAT;
    centre FLOAT;
    adjustment FLOAT;
BEGIN
    IF total = 0 THEN
        RETURN 0;
    END IF;
    
    p := positive::FLOAT / total;
    denominator := 1 + z * z / total;
    centre := p + z * z / (2 * total);
    adjustment := z * SQRT((p * (1 - p) + z * z / (4 * total)) / total);
    
    RETURN (centre - adjustment) / denominator;
END;
$$ LANGUAGE plpgsql;