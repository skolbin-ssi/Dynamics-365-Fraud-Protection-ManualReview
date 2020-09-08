package com.griddynamics.msd365fp.manualreview.action

import io.gatling.core.Predef._
import io.gatling.http.Predef._

object RegularAnalystOpenQueuesView {

  val resourceRequestHeaders = Map(
    "Accept" -> "application/json, text/plain, */*",
    "authorization" -> "Bearer ${authToken}"
  )

  val action = exec(http("Request root page").get("/"))
    .exec(http("Request current user").get("/api/users/me"))
    .exec(http("Request all users").get("/api/users"))
    .exec(
      http("Review console links").get("/api/settings/review-console-links")
    )
    .exec(http("Request self user").get("/api/users/me"))
    .exec(
      http("Get locked items for the current user")
        .get("/api/items/locked")
        .header("Virtual-User", "${virtualUser}")
    )
    .exec(
      http("Get all regular queues")
        .get("/api/queues?viewType=REGULAR")
        .header("Virtual-User", "${virtualUser}")
        .check(
          jsonPath("$..reviewers")
            .ofType[Seq[Any]]
            .findAll
            .transform(_.flatten)
            .saveAs("regularReviewers")
        )
        .check(
          jsonPath("$..views[?(@.viewType == 'REGULAR')].viewId").findRandom
            .saveAs("regularQueue")
        )
    )
    .foreach(session => session("regularReviewers").as[Seq[Any]], "reviewer") {
      exec(
        http("Request photo")
          .get("/api/users/${reviewer}/photo")
          .headers(resourceRequestHeaders)
      )
    }
    .exec(
      http("Get locked items for the current user")
        .get("/api/items/locked")
        .header("Virtual-User", "${virtualUser}")
    )
    .exec(
      http("Get regular queue to show as autoselected queue")
        .get("/api/queues/${regularQueue}")
        .header("Virtual-User", "${virtualUser}")
        .check(
          jsonPath("$..allowedLabels")
            .ofType[Seq[Any]]
            .find
            .saveAs("allowedLabels")
        )
    )
    .exec(
      http("Get N items from the regular queue to show in autoselected queue")
        .get("/api/queues/${regularQueue}/items?size=18")
        .header("Virtual-User", "${virtualUser}")
    )
    .exec(
      http("Get N items from the regular queue to show in autoselected queue")
        .get("/api/queues/${regularQueue}/items?size=18")
        .header("Virtual-User", "${virtualUser}")
    )
}
