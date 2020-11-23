package com.griddynamics.msd365fp.manualreview.action

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._

object RegularAnalystReviewsOrder {

  val action = exec(
    http("Lock top item")
      .post("/api/queues/${regularQueue}/top/lock")
      .header("Virtual-User", "${virtualUser}")
      .check(
        jsonPath("$.id")
          .find
          .saveAs("reviewOrder")
      )
  )
    .exec(
      http("Get order info")
        .get("/api/queues/${regularQueue}/items/${reviewOrder}")
        .header("Virtual-User", "${virtualUser}")
    )
    .pause(1 minute, 4 minutes)
    .tryMax(3) {
      exec(http("Label item")
        .patch("/api/items/${reviewOrder}/label")
        .header("Virtual-User", "${virtualUser}")
        .body(StringBody("{\"label\": \"${allowedLabels.random()}\"}"))
        .asJson
      )
    }
}
