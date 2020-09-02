package com.griddynamics.msd365fp.manualreview.model;

import java.io.Serializable;

public enum Label implements Serializable {
    ACCEPT(true),
    REJECT(true),
    HOLD(false),
    ESCALATE(false),
    WATCH_NA(true),
    WATCH_INCONCLUSIVE(true);

    private final boolean formsResolution;

    Label(boolean formsResolution) {
        this.formsResolution = formsResolution;
    }

    public boolean isFormsResolution() {
        return formsResolution;
    }
}
