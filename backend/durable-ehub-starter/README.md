# Utility library for durable connection to Azure Event Hubs
Contains automatically created clients (based on properties and 
provided processorExecutorRegistry).
The main difference from plain usage (com.azure:azure-messaging-eventhubs) and 
from Spring Cloud usage (com.microsoft.azure:spring-cloud-azure-eventhubs-stream-binder) 
is automatic client recreation based on error threshold and time of work.

**WARNING!!!** This starter has a specific LOGBACK configuration for excess warn 
log filtering. It can have conflicts with other configurations.
  