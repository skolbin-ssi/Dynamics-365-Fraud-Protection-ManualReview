package com.griddynamics.msd365fp.manualreview

import com.griddynamics.msd365fp.manualreview.action.AdminManagerGenerateOrder
import io.gatling.core.Predef._
import io.gatling.http.Predef._

class DFPEventFlowSimulation extends Simulation {

  val baseUrl = System.getenv("BASE_URL")
  val authToken = System.getenv("AUTH_TOKEN")
  val queueId = "50ebb4bd-283e-4cc4-84dd-c5212172b7bf-REGULAR"

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

  val scn = scenario("DFP EventHub events receiving")
    .exec(_.set("authToken", authToken))
    .exec(_.set("queueId", queueId))
    .exec(_.set("amount", 100))
    .exec(AdminManagerGenerateOrder.action)
    .exec { session =>
    println(session)
      session
    }

  setUp(scn.inject(atOnceUsers(1))).protocols(httpProtocol)
}
