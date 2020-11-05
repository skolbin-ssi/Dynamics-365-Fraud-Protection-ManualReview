package com.griddynamics.msd365fp.manualreview

import com.griddynamics.msd365fp.manualreview.action.OpenQueuesViewWithFrontend
import io.gatling.core.Predef._
import io.gatling.http.Predef._

class QueuesPageSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl(AuthorisationInfo.baseUrl)
    .header("sec-fetch-site", "same-origin")
    .header("sec-fetch-mode", "cors")
    .header("sec-fetch-dest", "empty")
    .header("origin", AuthorisationInfo.baseUrl)
    .authorizationHeader("Bearer ${authToken}")
    .acceptLanguageHeader("en-US,en;q=0.9,ru;q=0.8")
    .inferHtmlResources()
    .silentResources
    .userAgentHeader("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36")

  val scn = scenario("DashboardPageSimulation")
    .exec(_.set("authToken", AuthorisationInfo.authToken))
    .repeat(10) {
      exec(OpenQueuesViewWithFrontend.action)
    }

  setUp(scn.inject(atOnceUsers(5))).protocols(httpProtocol)
}