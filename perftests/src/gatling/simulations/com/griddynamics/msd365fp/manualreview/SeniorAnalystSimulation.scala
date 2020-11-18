package com.griddynamics.msd365fp.manualreview

import com.griddynamics.msd365fp.manualreview.action.DashboardExploration
import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

class SeniorAnalystSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl(AuthorisationInfo.baseUrl)
    .header("sec-fetch-site", "same-origin")
    .header("sec-fetch-mode", "cors")
    .header("sec-fetch-dest", "empty")
    .header("origin", AuthorisationInfo.baseUrl)
    .authorizationHeader("Bearer ${authToken}")
    .acceptLanguageHeader("en-US,en;q=0.9,ru;q=0.8")
    .acceptEncodingHeader("gzip, deflate, br")
    .acceptHeader("application/json, text/plain, */*")
    .inferHtmlResources()
    .silentResources

  val scn = scenario("Senior analyst dashboard exploration")
    .exec(_.set("authToken", AuthorisationInfo.authToken))
    .feed(AuthorisationInfo.virtualUserFeeder)
    .exec(DashboardExploration.action)
    .exitHereIfFailed

  setUp(scn.inject(
    atOnceUsers(5),
    rampUsers(10) during (5 minutes),
  )).protocols(httpProtocol)
}
