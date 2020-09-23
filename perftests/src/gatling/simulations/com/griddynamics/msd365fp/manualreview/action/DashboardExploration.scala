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
    .exec(
      http("Get map of queue overviews for Overview dashboard")
        .get("/api/queues/overview?timeToSla=P2D&timeToTimeout=PT5M")
    )
    .exec(
      http("Get list of collected analysts")
        .get("/api/collected-info/analysts")
    )
    .exec(
      http("Get list of collected queues")
        .get("/api/collected-info/queues")
    )
    .exec(
      http("Get all direct queues")
        .get("/api/queues?viewType=DIRECT")
    )
    .exec(
      http("Get size history metrics for all queues")
        .get(
          "/api/dashboards/size-history/overall?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
        )
    )
    .pause(2 minutes)
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
        .exec(
          http("Get demand/supply metrics for all queues")
            .get(
              "/api/dashboards/item-placement/overall?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .exec(
          http("Get demand/supply metrics for list of queues")
            .get(
              "/api/dashboards/item-placement/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"
            )
        )
        .pause(1 minute)
        .exec(
          http("Get size history metrics for list of queues")
            .get(
              "/api/dashboards/size-history/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D&queue=${queueId}"
            )
        )
        .exec(
          http("Get queue view details by ID")
            .get("/api/queues/${queueId}")
        )
        .exec(
          http("Get demand/supply metrics for list of queues")
            .get(
              "/api/dashboards/item-placement/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D&queue=${queueId}"
            )
        )
        .exec(
          http("Get list of items by queue for Overview Dashboard")
            .get(
              "/api/queues/${queueId}-REGULAR/overview?size=18&timeToSla=P2D&timeToTimeout=PT5M"
            )
        )
        .exec(
          http("Get list of items by queue for Overview Dashboard")
            .get(
              "/api/queues/${queueId}-ESCALATION/overview?size=18&timeToSla=P2D&timeToTimeout=PT5M"
            )
        )
        .pause(1 minute)
        .exec(
          http("Get size history metrics for list of queues")
            .get(
              "/api/dashboards/size-history/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P7D&queue=${queueId}"
            )
        )
        .exec(
          http("Get demand/supply metrics for list of queues")
            .get(
              "/api/dashboards/item-placement/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P7D&queue=${queueId}"
            )
        )
        .pause(1 minute)
        .exec(
          http("Get size history metrics for list of queues")
            .get(
              "/api/dashboards/size-history/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P31D&queue=${queueId}"
            )
        )
        .exec(
          http("Get demand/supply metrics for list of queues")
            .get(
              "/api/dashboards/item-placement/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P31D&queue=${queueId}"
            )
        )
    }
}
