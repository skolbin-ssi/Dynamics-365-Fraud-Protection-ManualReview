package com.griddynamics.msd365fp.manualreview.dfpauth.util;

import com.microsoft.azure.spring.autoconfigure.aad.UserPrincipal;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

import static com.griddynamics.msd365fp.manualreview.dfpauth.config.Constants.*;

@UtilityClass
public class UserPrincipalUtility {

    public String getUserId() {
        return extractUserId(SecurityContextHolder.getContext().getAuthentication());
    }

    public List<String> getUserRoles() {
        return extractUserRoles(SecurityContextHolder.getContext().getAuthentication());
    }

    public String extractUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return extractUserId((UserPrincipal) auth.getPrincipal());
        }
        return null;
    }

    public String extractUserId(UserPrincipal principal) {
        if (principal != null) {
            Object subClaim = principal.getClaim(AUTH_TOKEN_SUB_CLAIM);
            Object idClaim = principal.getClaim(AUTH_TOKEN_PRINCIPAL_ID_CLAIM);
            if (idClaim != null && subClaim != null && !StringUtils.equals(subClaim.toString(), idClaim.toString())) {
                return idClaim.toString();
            }
        }
        return null;
    }

    public List<String> extractUserRoles(Authentication auth) {
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
    }


}
