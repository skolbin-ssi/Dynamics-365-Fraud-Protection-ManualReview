package com.griddynamics.msd365fp.manualreview.action

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.language.postfixOps

object AdminManagerGenerateOrder {


  val action = exec(
    http("Get original size")
      .get("/api/queues/${queueId}")
      .check(
        jsonPath("$.size")
          .ofType[Int]
          .find
          .saveAs("originalSize")
      )
  )
    .exec(
      http("Generate [${amount}] purchase events in DFP")
        .post("/api/testing/dfp/events")
        .queryParam("amount", "${amount}")
        .check(
          status.in(200, 503)
        )
    )
    .exec(session => session.set("startTime", System.nanoTime()))
    .pause(30 seconds)
    .exec(
      http("Get new size")
        .get("/api/queues/${queueId}")
        .check(
          jsonPath("$.size")
            .ofType[Int]
            .find
            .saveAs("newSize")
        )
    )
    .doWhileDuring(
      session => session("newSize").as[Int].<(session("originalSize").as[Int] + session("amount").as[Int]),
      15 minutes
    ) {
      pause(30 seconds)
        .exec(session => session.set("endTime", System.nanoTime()))
        .exec(
          http(session => {
            val itemsProcessed = session("newSize").as[Int] - session("originalSize").as[Int]
            val duration = Duration.fromNanos(session("endTime").as[Long] - session("startTime").as[Long]).toSeconds
            "Items processed [" + itemsProcessed + "]. Time passed [" + duration + " seconds]"
          })
            .get("/api/queues/${queueId}")
            .check(
              jsonPath("$.size")
                .ofType[Int]
                .find
                .saveAs("newSize")
            )
        )
    }

}
