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

# Check if we should use existing project or create new one
locals {
  use_existing_project = var.existing_project_id != null && var.existing_project_id != ""
}

# Create project only if not using existing one
resource "neon_project" "participation_app" {
  count                    = local.use_existing_project ? 0 : 1
  name                     = "participation-app"
  region_id                = "aws-us-east-1"
  history_retention_seconds = 21600
}

# Use existing project ID or reference the created one
locals {
  participation_project_id = local.use_existing_project ? var.existing_project_id : neon_project.participation_app[0].id
}

# Create role only if project was just created
resource "neon_role" "participation_owner" {
  count      = local.use_existing_project ? 0 : 1
  project_id = neon_project.participation_app[0].id
  name       = "participation_owner"
  branch_id  = neon_project.participation_app[0].default_branch_id
}

# Create database only if project was just created
resource "neon_database" "participation_db" {
  count      = local.use_existing_project ? 0 : 1
  project_id = neon_project.participation_app[0].id
  name       = "participation"
  owner_name = neon_role.participation_owner[0].name
  branch_id  = neon_project.participation_app[0].default_branch_id
}

# Output basic information
output "project_id" {
  value = local.participation_project_id
}

output "database_name" {
  value = local.use_existing_project ? "participation" : neon_database.participation_db[0].name
}

output "role_name" {
  value = local.use_existing_project ? "participation_owner" : neon_role.participation_owner[0].name
}

output "role_password" {
  value     = local.use_existing_project ? "***EXISTING***" : neon_role.participation_owner[0].password
  sensitive = true
}

output "database_url" {
  value     = local.use_existing_project ? "***EXISTING_PROJECT***" : neon_project.participation_app[0].connection_uri
  sensitive = true
}

output "hostname" {
  value     = local.use_existing_project ? "***EXISTING_PROJECT***" : neon_project.participation_app[0].connection_uri
  sensitive = true
}

