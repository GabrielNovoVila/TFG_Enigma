package com.example.enigma.Configuracion;


import com.example.enigma.Servicios.AutenticacionServicio;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AutenticacionServicio jwtService;
    private final String frontendUrl;

    public OAuth2SuccessHandler(AutenticacionServicio jwtService,
                                @Value("${app.frontend-url:}") String frontendUrl) {
        this.jwtService = jwtService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User user = (OAuth2User) authentication.getPrincipal();

        String email = user.getAttribute("email");
        String picture = user.getAttribute("picture");

        String accessToken = jwtService.generarAccessToken(email, picture);
        String refreshToken = jwtService.generarRefreshToken(email, picture);


        String redirectBaseUrl = StringUtils.hasText(frontendUrl)
                ? frontendUrl
                : "http://" + request.getServerName() + ":3000";
        String redirectUrl = redirectBaseUrl.replaceAll("/$", "")
                + "/login-success?access=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refresh=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }
}
