package com.griddynamics.msd365fp.manualreview.action

import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import scala.util.Random

object OpenItemViewWithFrontend {
  val akamaihdUrl = "https://spoprod-a.akamaihd.net/files/fabric/assets/icons"
  val sharepointUrl = "https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean"
  val microsoftAtlasUrl = "https://atlas.microsoft.com"
  val visualstudioServicesUrl = "https://dc.services.visualstudio.com/v2/track"

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
      http("Preparation: retrieve queueId")
        .get("/api/queues?viewType=REGULAR") //todo filter by size?
        .check(
          jsonPath("$..queueId")
            .find(0)
            .saveAs("queueId")
        )
    )
    .exec(
      http("Preparation: retrieve itemsIds")
        .get("/api/queues/${queueId}/items?size=10")
        check (
        jsonPath("$.values..id")
          .findAll
          .saveAs("itemsIds")
        )
    )
    .foreach(session => session("itemsIds").as[Seq[String]], "itemId") {
      exec(
        http("Request item")
          .get("/queues/${queueId}-REGULAR/item/${itemId}")
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
          http("/favicon.ico")
            .get("/favicon.ico"))
        .exec(http("/api/users/me")
          .get("/api/users/me"))
        .exec(http("/api/users")
          .get("/api/users"))
        .exec(
          http("Review console links")
            .get("/api/settings/review-console-links")
        )
        .exec(http("Get item")
          .get("/api/items/${itemId}?queueId=${queueId}-REGULAR")
        )
        .exec(http("Get queue")
          .get("/api/queues/${queueId}-REGULAR")
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
          )
        )
        .exec(http("/api/items/locked")
          .get("/api/items/locked")
        )
        .exec(http("Request sharepoint fonts")
          .get(sharepointUrl + "/segoeui-regular.woff2")
        )
        .exec(http("Request sharepoint fonts")
          .get(sharepointUrl + "/segoeui-semibold.woff2")
        )
        .exec(http("Request sharepoint fonts")
          .get(sharepointUrl + "/segoeui-bold.woff2")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-10-c4ded8e4.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-17-0c4ed701.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-3-089e217a.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-1-4d521695.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-2-63c99abf.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-6-ef6fd590.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-a13498cf.woff")
        )
        .exec(http("Request akamai icons")
          .get(akamaihdUrl + "/fabric-icons-5-f95ba260.woff")
        )
        .foreach(session => session("regularReviewers").as[Seq[Any]], "reviewer") {
          exec(
            http("Request photo: /api/users/${reviewer}/photo")
              .get("/api/users/${reviewer}/photo")
          )
        }
        .foreach(session => session("regularSupervisors").as[Seq[Any]], "reviewer") {
          exec(
            http("Request photo")
              .get("/api/users/${reviewer}/photo")
          )
        }
    }
}
