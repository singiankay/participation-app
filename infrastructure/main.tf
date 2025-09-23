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

# Check if project exists
data "neon_projects" "all" {}

locals {
  # Check if participation-app project already exists
  existing_project = [
    for project in data.neon_projects.all.projects : project
    if project.name == "participation-app"
  ]
  
  project_exists = length(local.existing_project) > 0
}

# Create project only if it doesn't exist
resource "neon_project" "participation_app" {
  count                    = local.project_exists ? 0 : 1
  name                     = "participation-app"
  region_id                = "aws-us-east-1"
  history_retention_seconds = 21600
}

# Use existing project or reference the created one
locals {
  participation_project = local.project_exists ? local.existing_project[0] : neon_project.participation_app[0]
}

# Create role only if project was just created
resource "neon_role" "participation_owner" {
  count      = local.project_exists ? 0 : 1
  project_id = neon_project.participation_app[0].id
  name       = "participation_owner"
  branch_id  = neon_project.participation_app[0].default_branch_id
}

# Reference existing role if project exists, or use created one
data "neon_roles" "participation_roles" {
  count      = local.project_exists ? 1 : 0
  project_id = local.participation_project.id
}

locals {
  participation_owner_role = local.project_exists ? [
    for role in data.neon_roles.participation_roles[0].roles : role
    if role.name == "participation_owner"
  ][0] : neon_role.participation_owner[0]
}

# Create database only if project was just created
resource "neon_database" "participation_db" {
  count      = local.project_exists ? 0 : 1
  project_id = neon_project.participation_app[0].id
  name       = "participation"
  owner_name = neon_role.participation_owner[0].name
  branch_id  = neon_project.participation_app[0].default_branch_id
}

# Reference existing database if project exists, or use created one
data "neon_databases" "participation_databases" {
  count      = local.project_exists ? 1 : 0
  project_id = local.participation_project.id
}

locals {
  participation_database = local.project_exists ? [
    for db in data.neon_databases.participation_databases[0].databases : db
    if db.name == "participation"
  ][0] : neon_database.participation_db[0]
}

# Output basic information
output "project_id" {
  value = local.participation_project.id
}

output "database_name" {
  value = local.participation_database.name
}

output "role_name" {
  value = local.participation_owner_role.name
}

output "role_password" {
  value     = local.participation_owner_role.password
  sensitive = true
}

output "database_url" {
  value     = local.participation_project.connection_uri
  sensitive = true
}

output "hostname" {
  value     = local.participation_project.connection_uri
  sensitive = true
}

