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
