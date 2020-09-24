# Backend

This is a parent module of the Manual Review application. The application follows microservice architecture and contains 
the following main executable modules:
* [mr-queues](./queues) that responsible for real-time item processing in the queue-based paradigm.
* [mr-analytics](./analytics) that responsible for post-processing analysis and reporting. 

The module combines all services and provides common
configurations like `.gitignore` and `settings.gradle`.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and
testing purposes. See [deployment](../arm/README.md) for notes on how to deploy the project on a live system.

### Prerequisites

* Az Cli version 2.10.0
* Oracle Java 11.0.8
* The recommended IDE is the IntelliJ IDEA.
* For the Lombok usage, the IDE should have [Lombok plugin](https://plugins.jetbrains.com/plugin/6317-lombok) 
and enabled [annotation processing](https://stackoverflow.com/questions/41161076/adding-lombok-plugin-to-intellij-project).
* It's recommended to use `./gradlew` script for building and running. So, there is no need to install Gradle.
* for integrations you should have an account that has access to Azure Tenant and Azure Subscription used for deployment
and also has access to read Azure Key Vault secrets in required environment.

### Building

The project is running under Gradle configuration and has multi-module architecture. There are two executable modules: 
`queues` and `analytics` along with several libraries. Libraries are intended to separate
common logic across reusable modules. It's not possible to run libraries apart from
executable modules. You should build and run executable modules with `./gradlew` 
(or `.\gradlew.bat` for Windows environment) scripts inside their folders.

In case if you only need to build executable packages you can use
```shell script
./gradlew bootJar
```
to get a `.jar` file in `./build/libs` folder or
```shell script
./gradlew clean packageDist
```
to get a `.zip` file in `./build/dist` that can be used for uploading to 
[Azure App Service](https://azure.microsoft.com/en-us/services/app-service/) instance.

For comprehensive build with
```shell script
./gradlew build
``` 
you need to provide mocked [integrations](#configure-integration) such as EventHub, CosmosDB, Azure AD, and etc. 
and use actual credentials. These services are used for integration tests that currently aren't separated 
from unit tests. Thus be cautious in choosing your environment variables and foresee risks of 
unoptimized code to avoid unexpected costs in Azure resources.

### Configure integration 

To get the whole environment installed, please, refer to  [deployment](../arm/README.md).
To get environment variables that are used by application to connect to cloud environment, run [script](./getEnv.sh)
with specified environment name:
```shell script
/getEnv.sh "<name_that_is_prefix_of_deployment>"
```
__Warning!__ You need to be unlogined in "Az Cli" or be logined with appropriate account. In first case the script will
route you to login page.   
__Warning!__ In order to get all variables you should have enough [permissions](#prerequisites).

The script output under the `-----[ Result ]-----` row will contain the set of variables that you need to have 
established in your environment before local launch or comprehensive build.

__Warning!__ Values in the script output are unescaped. Be careful if there are special symbols. 

### Local Launch

To install the project locally please follow these steps:
1. Define environment variables from that you extracted from [existing installation](#configure-integration) ether in 
a terminal session if you run from console or in IDE run configuration if you work with it 
(e.g. [run configuration in IDEA](https://www.jetbrains.com/help/objc/add-environment-variables-and-program-arguments.html#add-environment-variables)).
2. Execute command `./gradlew clean build` in project root directory or run `clean` and then `build` tasks in IDE
3. (Optional) Define advanced variables for `bootRun` task in queues/analytics modules:
    * `SPRING_PROFILES_ACTIVE=local` activates `application-local.yml` configuration which overrides default `application.yml` file.
    * `SPRING_OUTPUT_ANSI_ENABLED=ALWAYS` prints colorful logs in console output.
    * `SERVER_PORT=8081` change the port of one spring application to 8081 to be able to run both of them simultaneously.
4. Execute command `./gradlew bootRun` in project root directory or run `bootRun` task in IDE in order to launch application locally

Here's an example of shared `${PROJECT_DIR}/.idea/runConfiguration/queues__GRADLE_.xml` config exported for Queues BE.
You can replace environment variables with those that are required for your solution and import it into your IDE.
```
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="queues" type="GradleRunConfiguration" factoryName="Gradle">
    <ExternalSystemSettings>
      <option name="env">
        <map>
          <entry key="SPRING_OUTPUT_ANSI_ENABLED" value="ALWAYS" />
          <entry key="SPRING_PROFILES_ACTIVE" value="local" />
        </map>
      </option>
      <option name="executionName" />
      <option name="externalProjectPath" value="$PROJECT_DIR$/queues" />
      <option name="externalSystemIdString" value="GRADLE" />
      <option name="scriptParameters" value="" />
      <option name="taskDescriptions">
        <list />
      </option>
      <option name="taskNames">
        <list>
          <option value="bootRun" />
        </list>
      </option>
      <option name="vmOptions" value="" />
    </ExternalSystemSettings>
    <GradleScriptDebugEnabled>true</GradleScriptDebugEnabled>
    <method v="2" />
  </configuration>
</component>
```

Below there are additional integration options for local launch. 

#### Application Insights

If you'd like to use Application Insights in your local launch then continue from step 2 in [launch flow](#local-launch):

3. Build both modules with `./gradlew bootJar` command.
4. Add environment variables to your current session:
* `APPLICATIONINSIGHTS_CONNECTION_STRING` is needed for AI javaagent to initialize Exporter which will send
all telemetry to the cloud.
* `APPLICATIONINSIGHTS_CONFIGURATION_FILE` is optional. It sets the path for ApplicationInsights.json configuration which
will override project default ApplicationInsights.json file.
5. Run each built module with `java -Dspring.profiles.active=local
-javaagent:<project-dir>/backend/<module>/build/resources/main/applicationinsights-agent/applicationinsights-agent-3.0.0-PREVIEW.5.jar
-jar <module>/build/libs/<module>-0.0.1-SNAPSHOT.jar` command. `<module>` is either `analytics` or `queues`.

Here's an example of shared `${PROJECT_DIR}/.idea/runConfiguration/analytics__JAR_.xml` config exported with `msd365fp-mr-ai1`
solution variables for Analytics BE. You can replace environment variables with those that are required for your solution
and import it into your IDE.
```
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="analytics [JAR]" type="JarApplication">
    <option name="JAR_PATH" value="$PROJECT_DIR$/analytics/build/libs/analytics-0.0.1-SNAPSHOT.jar" />
    <option name="VM_PARAMETERS" value="-javaagent:$PROJECT_DIR$/analytics/build/resources/main/applicationinsights-agent/applicationinsights-agent-3.0.0-PREVIEW.5.jar -Dserver.port=8081 -Dspring.profiles.active=local -Dspring.ansi.output.enabled=ALWAYS" />
    <option name="WORKING_DIRECTORY" value="$PROJECT_DIR$/analytics" />
    <option name="ALTERNATIVE_JRE_PATH" />
    <envs>
      <env name="APPLICATIONINSIGHTS_CONFIGURATION_FILE" value="$USER_HOME$/mr/ApplicationInsights_analytics.json" />
      <env name="APPLICATIONINSIGHTS_CONNECTION_STRING" value="InstrumentationKey=99bd42f3-5738-4d01-9c74-aee2d147133a" />
    </envs>
    <method v="2">
      <option name="Gradle.BeforeRunTask" enabled="true" tasks="bootJar" externalProjectPath="$PROJECT_DIR$/analytics" vmOptions="" scriptParameters="" />
    </method>
  </configuration>
</component>
```

#### Key Vault

Both services use Azure KeyVault integration to manage secrets for all dependencies. 
By default [managed identity](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity?tabs=dotnet)
way of authentication is used. This is a preferable way for cloud application to rotate secrets this way. However, it is not
currently supported by Azure Java SDK to use managed identity locally, so 
[service principle](https://docs.microsoft.com/en-us/azure/key-vault/secrets/quick-create-java#create-a-service-principal)
is used instead for local usage. You don't need to provide extra secrets for this solution, because Azure AD secret is used
as client key.  

## Microsoft Open Source code of conduct

For additional information, see the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct).