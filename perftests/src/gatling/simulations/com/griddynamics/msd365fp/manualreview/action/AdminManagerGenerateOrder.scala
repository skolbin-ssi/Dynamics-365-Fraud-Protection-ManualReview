package com.griddynamics.msd365fp.manualreview.action

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

object AdminManagerGenerateOrder {

  val action = foreach(1 to 6, "i") {
    exec(
      http("Generate purchase events in DFP: ${amount} [Total: ${repeats}]")
        .post("/api/testing/dfp/events")
        .queryParam("amount", "${amount}"))
      .exec { session =>
        session.set("repeats", session.attributes("amount").asInstanceOf[Int] +
          session.attributes("repeats").asInstanceOf[Int])
      }
      .pause(30 seconds)
  }
}
