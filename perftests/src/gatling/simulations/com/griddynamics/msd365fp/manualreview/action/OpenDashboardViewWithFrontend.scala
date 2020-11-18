package com.griddynamics.msd365fp.manualreview.action

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

import io.gatling.core.Predef._
import io.gatling.http.Predef._

object OpenDashboardViewWithFrontend {
  val sharepointUrl = "https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean"
  val akamaihdUrl = "https://spoprod-a.akamaihd.net/files/fabric/assets/icons"

  val currentStartOfDay = OffsetDateTime
    .now()
    .truncatedTo(ChronoUnit.DAYS)
  val currentEndOfDay = OffsetDateTime
    .now()
    .withHour(23)
    .withMinute(59)
    .withSecond(59)

  val action =
    exec(_.set("currentStartOfDay", currentStartOfDay.toInstant))
      .exec(_.set("currentEndOfDay", currentEndOfDay.toInstant))
      .exec(
        http("/dashboard/queues")
          .get("/queues")
          .check(
            regex("/static/js/.*?\\.js")
              .ofType[String]
              .findAll
              .saveAs("jsPaths")
          )
          .check(
            regex("/static/css/.*?\\.css")
              .ofType[String]
              .findAll
              .saveAs("cssPaths")
          )
      )
      .foreach(session => session("jsPaths").as[Seq[String]], "jsPath") {
        exec(
          http("Request ${jsPath}")
            .get("${jsPath}")
        )
      }
      .foreach(session => session("cssPaths").as[Seq[String]], "cssPath") {
        exec(
          http("Request ${cssPath}")
            .get("${cssPath}")
        )
      }
      .exec(
        http("config.json")
          .get("/config.json"))
      .exec(
        http("Fonts: segoeui-regular.woff2")
          .get(sharepointUrl + "/segoeui-regular.woff2"))
      .exec(
        http("Fonts: segoeui-semibold.woff2")
          .get(sharepointUrl + "/segoeui-semibold.woff2"))
      .exec(
        http("Fonts: segoeui-bold.woff2")
          .get(sharepointUrl + "/segoeui-bold.woff2"))
      .exec(http("/api/users/me")
        .get("/api/users/me"))
      .exec(http("/api/users")
        .get("/api/users"))
      .exec(
        http("Fonts: /fabric-icons-6-ef6fd590.woff")
          .get(akamaihdUrl + "/fabric-icons-6-ef6fd590.woff"))
      .exec(
        http("Fonts: /fabric-icons-a13498cf.woff")
          .get(akamaihdUrl + "/fabric-icons-a13498cf.woff"))
      .exec(
        http("Fonts: /fabric-icons-5-f95ba260.woff")
          .get(akamaihdUrl + "/fabric-icons-5-f95ba260.woff"))
      .exec(
        http("Fonts: /fabric-icons-10-c4ded8e4.woff")
          .get(akamaihdUrl + "/fabric-icons-10-c4ded8e4.woff"))
      .exec(
        http("Fonts: /fabric-icons-17-0c4ed701.woff")
          .get(akamaihdUrl + "/fabric-icons-17-0c4ed701.woff"))
      .exec(
        http("Fonts: /fabric-icons-1-4d521695.woff")
          .get(akamaihdUrl + "/fabric-icons-1-4d521695.woff"))
      .exec(
        http("/api/settings/review-console-links")
          .get("/api/settings/review-console-links"))
      .exec(
        http("/api/collected-info/analysts")
          .get("/api/collected-info/analysts"))
      .exec(
        http("/api/collected-info/queues")
          .get("/api/collected-info/queues"))
      .exec(http(
        "/api/items/locked")
        .get("/api/items/locked"))
      .exec(
        http("/api/dashboards/labeling/queues?from&to")
          .get("/api/dashboards/labeling/queues?from=${currentStartOfDay}&to=${currentEndOfDay}&aggregation=P1D"))
      .exec(http(
        "/api/queues?viewType=REGULAR")
        .get("/api/queues?viewType=REGULAR")
        .check(
          jsonPath("$..reviewers")
            .ofType[Seq[Any]]
            .findAll
            .transform(_.flatten)
            .saveAs("regularReviewers")
        )
        .check(
          jsonPath("$..supervisors")
            .ofType[Seq[Any]]
            .findAll
            .transform(_.flatten)
            .saveAs("regularSupervisors")
        ),
      )
      .foreach(session => session("regularReviewers").as[Seq[Any]], "reviewer") {
        exec(
          http("Request photo: /api/users/${reviewer}/photo")
            .get("/api/users/${reviewer}/photo")
        )
      }
      .foreach(session => session("regularSupervisors").as[Seq[Any]], "reviewer") {
        exec(
          http("Request photo: /api/users/${reviewer}/photo")
            .get("/api/users/${reviewer}/photo")
        )
      }
}
