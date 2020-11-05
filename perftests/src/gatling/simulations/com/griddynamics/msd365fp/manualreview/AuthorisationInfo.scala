package com.griddynamics.msd365fp.manualreview

import io.gatling.core.Predef._
import io.gatling.core.feeder.BatchableFeederBuilder

object AuthorisationInfo {

  val baseUrl: String = System.getenv("BASE_URL")
  val authToken: String = System.getenv("AUTH_TOKEN")
  val virtualUserFeeder: BatchableFeederBuilder[String]#F = csv("virtualusers.csv").eager.queue
}