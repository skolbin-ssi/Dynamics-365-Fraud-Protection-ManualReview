package com.griddynamics.msd365fp.manualreview

import io.gatling.app.Gatling
import io.gatling.core.config.GatlingPropertiesBuilder

object GatlingRunner {

  def main(args: Array[String]): Unit = {
    val simClass = classOf[RegularAnalystSimulation].getName
    val props = new GatlingPropertiesBuilder
    props.simulationClass(simClass)
    Gatling.fromMap(props build)
  }
}
