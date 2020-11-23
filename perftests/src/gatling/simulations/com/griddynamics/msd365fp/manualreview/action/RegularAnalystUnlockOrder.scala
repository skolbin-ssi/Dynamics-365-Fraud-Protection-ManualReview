package com.griddynamics.msd365fp.manualreview.action

import io.gatling.core.Predef._
import io.gatling.http.Predef._

object RegularAnalystUnlockOrder {

  val action = exec(
    http("Unlock top item")
      .delete("/api/items/${reviewOrder}/lock")
      .header("Virtual-User", "${virtualUser}")
  )
}
