package com.griddynamics.msd365fp.manualreview

import com.griddynamics.msd365fp.manualreview.action.{
  RegularAnalystOpenQueuesView,
  RegularAnalystReviewsOrder,
  RegularAnalystUnlockOrder
}
import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

class RegularAnalystSimulation extends Simulation {

  val baseUrl = System.getenv("BASE_URL")

  val authToken = System.getenv("AUTH_TOKEN")

  val virtualUserFeeder = csv("virtualusers.csv").eager.queue

  val httpProtocol = http
    .baseUrl(baseUrl)
    .header("sec-fetch-site", "same-origin")
    .header("sec-fetch-mode", "cors")
    .header("sec-fetch-dest", "empty")
    .header("origin", baseUrl)
    .authorizationHeader("Bearer ${authToken}")
    .acceptLanguageHeader("en-US,en;q=0.9,ru;q=0.8")
    .acceptEncodingHeader("gzip, deflate, br")
    .acceptHeader("application/json, text/plain, */*")
    .inferHtmlResources()
    .silentResources

  val scn = scenario("Regular analyst behaviour")
    .exec(_.set("authToken", authToken))
    .feed(virtualUserFeeder)
    .exec(RegularAnalystOpenQueuesView.action)
    .exitHereIfFailed
    .pause(5 seconds, 30 seconds)
    .during(30 minutes) {
        exec(RegularAnalystReviewsOrder.action)
    }
    .exec(RegularAnalystUnlockOrder.action)
    .exec(RegularAnalystOpenQueuesView.action)

  setUp(scn.inject(
    nothingFor(1 minute),
    atOnceUsers(5),
    rampUsers(10) during (5 minutes),
  )).protocols(httpProtocol)
}
