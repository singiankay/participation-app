terraform {
  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.2"
    }
  }
  required_version = ">= 1.0"
}

provider "neon" {
  api_key = var.neon_api_key
}

# Create a project
resource "neon_project" "participation_app" {
  name      = "participation-app"
  region_id = "aws-us-east-1"
}

# Create a database
resource "neon_database" "participation_db" {
  project_id = neon_project.participation_app.id
  name       = "participation"
  owner_name = neon_role.participation_owner.name
}

# Create a role for the application
resource "neon_role" "participation_owner" {
  project_id = neon_project.participation_app.id
  name       = "participation_owner"
}

# Create a branch (optional - for development)
resource "neon_branch" "development" {
  project_id = neon_project.participation_app.id
  name       = "development"
}

# Output the connection string
output "database_url" {
  value     = "postgresql://${neon_role.participation_owner.name}:${neon_role.participation_owner.password}@${neon_project.participation_app.hostname}/${neon_database.participation_db.name}?sslmode=require"
  sensitive = true
}

output "project_id" {
  value = neon_project.participation_app.id
}

output "hostname" {
  value = neon_project.participation_app.hostname
}
