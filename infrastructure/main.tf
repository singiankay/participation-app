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
  name                     = "participation-app"
  region_id                = "aws-us-east-1"
  history_retention_seconds = 21600
}

# Create a role for the application
resource "neon_role" "participation_owner" {
  project_id = neon_project.participation_app.id
  name       = "participation_owner"
  branch_id  = neon_project.participation_app.default_branch_id
}

# Create a database
resource "neon_database" "participation_db" {
  project_id = neon_project.participation_app.id
  name       = "participation"
  owner_name = neon_role.participation_owner.name
  branch_id  = neon_project.participation_app.default_branch_id
}

# Output basic information
output "project_id" {
  value = neon_project.participation_app.id
}

output "database_name" {
  value = neon_database.participation_db.name
}

output "role_name" {
  value = neon_role.participation_owner.name
}

output "role_password" {
  value     = neon_role.participation_owner.password
  sensitive = true
}

output "database_url" {
  value     = neon_project.participation_app.connection_uri
  sensitive = true
}

output "hostname" {
  value     = neon_project.participation_app.connection_uri
  sensitive = true
}

