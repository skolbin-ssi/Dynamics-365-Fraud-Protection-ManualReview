# Perftests

The perftests module written in scala uses Gatling framework for performance testing [backend](../backend) and [frontend](../frontend) modules. 
Performance tests can be split into [simulations](https://gatling.io/docs/current/general/concepts/#simulation). Each simulation represents a 
[scenario](https://gatling.io/docs/current/general/concepts/#scenario) from the user point of view. Users, such regular analyst, senior analyst 
or admin manager, might have different simulations of the same scenario. Users in Gatling are actually 
[virtual users](https://gatling.io/docs/current/general/concepts/#virtual-user), so they don't use actual credentials. 

In order to authenticate test users and don't create them all by hands, you can use backend's backdoor which is only active when `perftests` 
profile is active in the running application. Anyway, to run a simulation you will need to provide your own access token (called idtoken) to let
all generated virtual users to use it when calling Azure resources.

### Run Performance Tests

1. Go to the `${projectDir}/perftests` directory.
1. Set environment variables:
    * AUTH_TOKEN - idtoken which you should obtain from [this](#create-users-for-tests) section.
    * BASE_URL - hostname with a protocol where all the requests will go (can be either `http://localhost` or `https://${prefix}.azuredf.net`).
1. Run `./gradlew gatlingRun` Gradle task to run all simulations which are placed in the source directory.

If you want to run only one simulation, check the official [documentation](https://github.com/lkishalmi/gradle-gatling-plugin#default-tasks) of 
the Gradle plugin.

### Debug Performance Tests

Create run config in Intellij IDEA of type `Application` and set the main class to `com.griddynamics.msd365fp.manualreview.GatlingRunner`. Also
define working directory and environment variables before debugging.

### Prepare Cloud Environment

Deploy dedicated resource group for performance tests:

1. Check if there are any existing resource group which is acceptable for running performance tests (dfp-manrev-dev should be fine). Otherwise follow
the instructions in the [arm deployment](../arm) README file on how to create new resource group with all required resources.

Add `perftest` profile to application profiles:

1. Open App Services | Configurations which you are about to test.
1. Click 'edit' against `JAVA_OPTS` variable
1. If there are no `-Dspring.profiles.active` parameter in the `JAVA_OPTS`, add `-Dspring.profiles.active=perftest` in the end of the string. 
Otherwise, just add `,perftest` in the end of it.
1. Save changes and restart app service (you need to do these steps with each replica).

Instantiate virtual machine where the tests will be running:

1. Check if there are any existing virtual machines in the same resource group as application which you are going to test. Otherwise proceed to the next steps.
1. Create [virtual machine](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal) in the same region if none is present. 
1. Grant yourself permissions to login to this VM and connect to it via ssh.
1. Install all required toolset (like Git and Java).
1. Clone repository in your home directory.

### Create Users for Tests

To create users for perfomance testing, first you will need to read this 
[section](https://docs.google.com/document/d/1we5YZDPwda8MTp-6FHqsfEwEfzBZi_Wi3AeLrfzcaug/edit#heading=h.tlh7rl7b6vua) 
of technical specification. In the [MR access](https://docs.google.com/document/d/1we5YZDPwda8MTp-6FHqsfEwEfzBZi_Wi3AeLrfzcaug/edit#heading=h.cn9kcybosyyr)
section you will find the instruction on how to create a user in DFP. You will need three users with different roles. Each role has approptiate
simulations to run, for example, dashboards are only accessible by senior analysts and managers, so regular analyst won't be able to test them.

You will need to obtain idtoken somehow to run any simulation. It is required to bypass login page where unauthenticated users are redirected to.
The easiest way to get it, is to login in the application and search for `msal.idtoken` key in the session storage - the value assotiated with this key is what
you need.

### Additional Links

Jira Epic: https://griddynamics.atlassian.net/browse/MDMR-454
Gatling Documentation: https://gatling.io/docs/current/general/
Gatling Gradle plugin: https://github.com/lkishalmi/gradle-gatling-plugin
