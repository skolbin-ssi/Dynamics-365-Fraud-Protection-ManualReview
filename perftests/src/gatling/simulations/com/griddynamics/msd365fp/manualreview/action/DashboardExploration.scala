package com.griddynamics.msd365fp.manualreview.action

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.util.Random

object DashboardExploration {

  val currentStartOfDay = OffsetDateTime
    .now()
    .truncatedTo(ChronoUnit.DAYS)
  val currentEndOfDay = OffsetDateTime
    .now()
    .withHour(23)
    .withMinute(59)
    .withSecond(59)
  val random = new Random()

  val action = exec(_.set("currentStartOfDay", currentStartOfDay.toInstant))
    .exec(_.set("currentEndOfDay", currentEndOfDay.toInstant))
    .foreach(1 to (random.nextInt(5) + 5), "i") {
      exec(
        http("Get all regular queues")
          .get("/api/queues?viewType=REGULAR")
          .check(
            jsonPath("$..views[?(@.viewType == 'ESCALATION')].viewId").findRandom
              .transform(
                matchingResult => matchingResult.replace("-ESCALATION", "")
              )
              .saveAs("queueId")
          )
      )
        .pause(30 seconds)
        .exec(
          http("Get Queues dashboard")
            .get(
              "/api/dashboards/labeling/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .pause(30 seconds)
        .exec(
        http("Get Queue details")
            .get(
              "/api/dashboards/labeling/analysts?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D&queue=${queueId}"
            )
        )
        .exec(
          http("Get Queue details")
            .get(
              "/api/dashboards/labeling/distribution/risk-score?bucketSize=100&queue=${queueId}&from=${currentStartOfDay}&to=${currentEndOfDay}"
            )
        )
        .pause(30 seconds)
        .exec(
          http("Get Analysts dashboard")
            .get(
              "/api/dashboards/labeling/analysts?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .pause(30 seconds)
        .exec(
          http("Get Demand/Supply dashboard data")
            .get(
              "/api/dashboards/item-placement/overall?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .exec(
          http("Get Demand/Supply dashboard data")
            .get(
              "/api/dashboards/size-history/overall?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .exec(
          http("Get Demand/Supply dashboard data")
            .get("/api/queues/overview?timeToSla=P2D&timeToTimeout=PT5M")
        )
        .exec(
          http("Get Demand/Supply dashboard data")
            .get("/api/queues?viewType=DIRECT")
        )
        .exec(
          http("Get Demand/Supply dashboard data")
            .get(
              "/api/dashboards/item-placement/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D&queue=${queueId}"
            )
        )
    }
}
