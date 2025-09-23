variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
  default     = null
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "existing_project_id" {
  description = "ID of existing Neon project to use (leave empty to create new)"
  type        = string
  default     = null
}
