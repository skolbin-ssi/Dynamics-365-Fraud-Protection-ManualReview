package com.griddynamics.msd365fp.manualreview.cosmos.utilities;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;

@Slf4j
@UtilityClass
public class IdUtility {
    public String encodeRestrictedChars(@NonNull String id) {
        String result = id
                .replace("%", ".25")
                .replace("/", ".2F")
                .replace("\\", ".5C")
                .replace("?", ".3F")
                .replace("#", ".23");

        if (!result.equals(id)) {
            log.error("Id [{}] contains one of restricted values (%, /, \\, ?, #)", id);
        }

        return result;
    }
}
